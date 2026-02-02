#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function testEnvCredentials() {
  console.log('🔍 Testing with .env.local credentials...\n');
  
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: [{ text: 'Generate one React interview question.' }]
        }],
        inferenceConfig: {
          maxTokens: 100,
          temperature: 0.7
        }
      })
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ SUCCESS! Your interview AI is ready!');
    console.log('📝 Response:', result.output.message.content[0].text);
    console.log('\n🚀 Run: npm run dev');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
      console.log('\n💳 Solution: Ask your AWS admin to add payment method to the account');
    } else if (error.message.includes('AccessDenied')) {
      console.log('\n🔐 Solution: Ask your AWS admin to attach this policy to your user:');
      console.log('Policy ARN: arn:aws:iam::aws:policy/AmazonBedrockFullAccess');
      console.log('Or create custom policy with: bedrock:InvokeModel permission');
    }
  }
}

testEnvCredentials();