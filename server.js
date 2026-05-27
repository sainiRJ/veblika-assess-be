require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const http = require("http")
const { Server } = require("socket.io")

const connectDB = require("./config/db")
const deploymentRoutes = require("./routes/deploymentRoutes")

const { initSocket } = require("./config/socket")

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

initSocket(io)

app.use(cors())
app.use(express.json())

app.use("/api", deploymentRoutes)

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)
})

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 4000, () => {
      console.log(`Server running on port ${process.env.PORT || 4000}`)
    })
  })
  .catch((err) => {
    console.log(err)
  })