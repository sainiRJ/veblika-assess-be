const { NodeSSH } = require("node-ssh")

const deployToEC2 = async ({ clientName, image }) => {
  if (process.env.USE_AWS_MOCK === "true") {
    console.log(`[MOCK AWS] Simulating EC2 Docker deployment for ${clientName}...`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return "mock-container-id"
  }

  const ssh = new NodeSSH()
  try {
    await ssh.connect({
      host: process.env.EC2_HOST,
      username: process.env.EC2_USERNAME,
      privateKey: process.env.EC2_PRIVATE_KEY.replace(/\\n/g, "\n")
    })

    const containerName = clientName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")

    const command = `docker pull ${image} && docker run -d --name ${containerName}-${Date.now()} ${image}`

    const result = await ssh.execCommand(command)

    if (result.stderr && !result.stdout) {
      throw new Error(result.stderr)
    }

    return result.stdout
  } finally {
    ssh.dispose()
  }
}

module.exports = deployToEC2