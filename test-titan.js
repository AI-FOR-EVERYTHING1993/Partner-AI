#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function testTitanModels() {
  console.log('🔍 Testing Amazon Titan Models (older, might have access)\n');
  
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Test older Titan models
  const titanModels = [
    'amazon.titan-tg1-large',
    'amazon.titan-text-lite-v1',
    'amazon.titan-text-express-v1'
  ];

  for (const modelId of titanModels) {
    console.log(`Testing ${modelId}...`);
    
    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        body: JSON.stringify({
          inputText: 'Generate one React interview question.',
          textGenerationConfig: {
            maxTokenCount: 100,
            temperature: 0.7
          }
        })
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ ${modelId} - WORKS!`);
      console.log(`📝 Response: ${result.results[0].outputText.substring(0, 100)}...\n`);
      
      // Update .env.local with working model
      console.log('🎉 SUCCESS! Found working Amazon model!');
      console.log(`Use: ${modelId}`);
      return modelId;
      
    } catch (error) {
      console.log(`❌ ${modelId} - ${error.message.substring(0, 50)}...\n`);
    }
  }
  
  console.log('💡 All models need access requests. But Polly works!');
  console.log('🎯 You can build voice features with Polly + external text models');
}

testTitanModels().catch(console.error);