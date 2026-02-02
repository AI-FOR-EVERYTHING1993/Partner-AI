#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function debugBedrock() {
  console.log('🔍 Debugging Bedrock SDK Issue...\n');
  
  // Test different credential configurations
  const configs = [
    {
      name: 'Environment Variables',
      config: {
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      }
    },
    {
      name: 'Default Provider',
      config: {
        region: 'us-east-1'
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`Testing ${name}...`);
    
    try {
      const client = new BedrockRuntimeClient(config);
      
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: [{ text: 'Hello' }]
          }],
          inferenceConfig: {
            maxTokens: 50,
            temperature: 0.7
          }
        })
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ ${name} - SUCCESS!`);
      console.log(`Response: ${JSON.stringify(result, null, 2)}\n`);
      break;
      
    } catch (error) {
      console.log(`❌ ${name} - Failed: ${error.message}`);
      console.log(`Error code: ${error.name}`);
      console.log(`Status: ${error.$metadata?.httpStatusCode}\n`);
    }
  }
}

debugBedrock().catch(console.error);