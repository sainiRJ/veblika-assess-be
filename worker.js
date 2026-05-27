require("dotenv").config()

const connectDB = require("./config/db")
const { Worker } = require("bullmq")

const redisConnection = require("./config/redis")
const Deployment = require("./models/Deployment")

const deployToEC2 = require("./services/deployToEC2")
const invokeLambda = require("./services/invokeLambda")

connectDB()
  .then(() => {
    console.log("Worker MongoDB Connected")
  })
  .catch((err) => {
    console.log(err)
  })

const worker = new Worker(
  "deploymentQueue",
  async (job) => {
    const { deploymentId, clientName, domain, image } = job.data

    try {
      console.log(`Processing job ${job.id} for client ${clientName}`)
      
      await Deployment.findByIdAndUpdate(deploymentId, {
        status: "Deploying"
      })

      // 1. Deploy to EC2
      await deployToEC2({
        clientName,
        image
      })

      // 2. Invoke Lambda for post-deployment setup
      await invokeLambda({
        clientName,
        domain,
        deploymentId
      })

      await Deployment.findByIdAndUpdate(
        deploymentId,
        {
          status: "Completed"
        }
      )

      console.log(`Deployment Completed for ${clientName}`)
    } catch (error) {
      console.error(`Deployment Failed for ${clientName}:`, error.message)

      await Deployment.findByIdAndUpdate(
        deploymentId,
        {
          status: "Failed"
        }
      )
    }
  },
  {
    connection: redisConnection
  }
)

worker.on("completed", (job) => {
  console.log(`Job completed ${job.id}`)
})