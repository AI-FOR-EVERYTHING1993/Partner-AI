const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config({ path: '.env.local' });

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testNovaModels() {
  const models = [
    "amazon.nova-lite-v1:0",
    "amazon.nova-pro-v1:0", 
    "amazon.nova-micro-v1:0"
  ];

  for (const modelId of models) {
    try {
      console.log(`\n🧪 Testing ${modelId}...`);
      
      const payload = {
        messages: [
          {
            role: "user",
            content: [
              {
                text: "Hello! Can you help me with interview preparation?"
              }
            ]
          }
        ],
        inferenceConfig: {
          maxTokens: 100,
          temperature: 0.7
        }
      };

      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(payload),
        contentType: "application/json"
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ ${modelId} - SUCCESS`);
      console.log(`Response: ${result.output?.message?.content?.[0]?.text || result.content || 'No content'}`);
      
    } catch (error) {
      console.log(`❌ ${modelId} - FAILED`);
      console.log(`Error: ${error.message}`);
    }
  }
}

testNovaModels().catch(console.error);