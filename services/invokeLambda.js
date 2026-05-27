const {
  LambdaClient,
  InvokeCommand
} = require("@aws-sdk/client-lambda")

const client = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const invokeLambda = async (payload) => {
  if (process.env.USE_AWS_MOCK === "true") {
    console.log(`[MOCK AWS] Simulating Lambda invocation for ${payload.clientName}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { StatusCode: 200 }
  }

  const command = new InvokeCommand({
    FunctionName: process.env.LAMBDA_FUNCTION_NAME,
    Payload: Buffer.from(JSON.stringify(payload))
  })

  return await client.send(command)
}

module.exports = invokeLambda