import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function GET() {
  try {
    console.log('Testing AWS Bedrock with real credentials...');
    
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 50,
        messages: [{ role: "user", content: "Say hello in one word" }]
      }),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    return Response.json({
      success: true,
      message: 'AWS Bedrock working with real AI!',
      aiResponse: result.content[0].text,
      credentials: 'Valid'
    });
    
  } catch (error) {
    console.error('AWS Test Error:', error);
    
    return Response.json({
      success: false,
      error: error.message,
      errorCode: error.name,
      suggestion: 'Check AWS Bedrock access and model permissions'
    });
  }
}