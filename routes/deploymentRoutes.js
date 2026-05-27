const express = require("express")

const router = express.Router()

const Deployment = require("../models/Deployment")
const deploymentQueue = require("../queues/deploymentQueue")

router.post("/deploy", async (req, res) => {
  try {
    const { clientName, domain, image } = req.body

    const deployment = await Deployment.create({
      clientName,
      domain,
      image
    })

    await deploymentQueue.add("deploy-job", {
      deploymentId: deployment._id,
      clientName,
      domain,
      image
    })

    res.status(200).json({
      success: true,
      deployment
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

router.get("/status/:id", async (req, res) => {
  try {
    const deployment = await Deployment.findById(req.params.id)

    res.status(200).json(deployment)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
})

module.exports = router