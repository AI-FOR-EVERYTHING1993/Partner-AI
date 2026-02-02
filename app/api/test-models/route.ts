import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

async function testModel(prompt: string, modelId: string) {
  const command = new InvokeModelCommand({
    modelId,
    body: JSON.stringify({
      messages: [{ 
        role: "user", 
        content: [{ text: prompt }]
      }],
      inferenceConfig: {
        maxTokens: 50,
        temperature: 0.7
      }
    }),
    contentType: "application/json",
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.output?.message?.content?.[0]?.text || "No response";
}

export async function GET() {
  try {
    // Test Nova Pro model  
    const novaResponse = await testModel(
      "Say 'Hello from Nova!' in exactly 3 words.", 
      "amazon.nova-pro-v1:0"
    );
    
    return Response.json({
      success: true,
      models: {
        nova: {
          model: "amazon.nova-pro-v1:0", 
          response: novaResponse,
          status: "working"
        }
      },
      message: "Nova Pro model is working correctly!"
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      details: "Check your AWS credentials and model access"
    }, { status: 500 });
  }
}