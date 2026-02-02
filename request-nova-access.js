#!/usr/bin/env node

const { BedrockClient, PutModelInvocationLoggingConfigurationCommand } = require('@aws-sdk/client-bedrock');
require('dotenv').config({ path: '.env.local' });

async function requestNovaAccess() {
  console.log('🚀 Requesting Amazon Nova Model Access...\n');
  
  const client = new BedrockClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Amazon Nova models to request
  const novaModels = [
    'amazon.nova-pro-v1:0',
    'amazon.nova-lite-v1:0', 
    'amazon.nova-micro-v1:0',
    'amazon.nova-2-sonic-v1:0',
    'amazon.titan-embed-text-v2:0'
  ];

  console.log('📋 Models to request access for:');
  novaModels.forEach(model => console.log(`  - ${model}`));
  
  console.log('\n💡 Note: Model access must be requested through AWS Console');
  console.log('🔗 Go to: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess');
  console.log('\n⚡ Quick test - checking current access...\n');

  // Test each model
  for (const modelId of novaModels) {
    try {
      const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
      
      const runtimeClient = new BedrockRuntimeClient({
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: 'Hello' }] }],
          inferenceConfig: { maxTokens: 10 }
        })
      });

      await runtimeClient.send(command);
      console.log(`✅ ${modelId} - ACCESS GRANTED!`);
      
    } catch (error) {
      if (error.message.includes('AccessDenied') || error.message.includes('Authentication')) {
        console.log(`❌ ${modelId} - Need to request access`);
      } else {
        console.log(`⚠️ ${modelId} - ${error.message.substring(0, 50)}...`);
      }
    }
  }

  console.log('\n🎯 If all models show "Need to request access":');
  console.log('1. Open: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess');
  console.log('2. Click "Request model access"');
  console.log('3. Select Amazon Nova models');
  console.log('4. Submit request (usually approved instantly)');
  console.log('5. Run: node test-amazon-models.js');
}

requestNovaAccess().catch(console.error);