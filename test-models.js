#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function testModelAccess() {
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Test different models to see which ones work
  const models = [
    'amazon.titan-text-lite-v1',
    'amazon.titan-text-express-v1', 
    'anthropic.claude-instant-v1',
    'anthropic.claude-v2',
    'anthropic.claude-3-haiku-20240307-v1:0'
  ];

  for (const modelId of models) {
    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        body: JSON.stringify({
          inputText: 'Hello',
          textGenerationConfig: {
            maxTokenCount: 50,
            temperature: 0.7
          }
        })
      });

      const response = await client.send(command);
      console.log(`✅ ${modelId} - WORKS!`);
      
      // If this works, use it for your interview app
      return modelId;
      
    } catch (error) {
      console.log(`❌ ${modelId} - ${error.message.substring(0, 50)}...`);
    }
  }
}

testModelAccess().then(workingModel => {
  if (workingModel) {
    console.log(`\n🎯 Use this model: ${workingModel}`);
  } else {
    console.log('\n🔍 Checking model access in AWS Console...');
  }
});