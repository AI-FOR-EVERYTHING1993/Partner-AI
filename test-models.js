require('dotenv').config({ path: '.env.local' });
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testModels() {
  const models = [
    'anthropic.claude-3-haiku-20240307-v1:0',
    'anthropic.claude-3-sonnet-20240229-v1:0'
  ];

  for (const model of models) {
    try {
      const start = Date.now();
      await client.send(new InvokeModelCommand({
        modelId: model,
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }]
        })
      }));
      console.log(`✅ ${model} - ${Date.now() - start}ms`);
    } catch (e) {
      console.log(`❌ ${model} - ${e.name}`);
    }
  }
}

testModels();