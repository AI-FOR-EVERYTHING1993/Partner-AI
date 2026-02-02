#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { fromIni } = require('@aws-sdk/credential-providers');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function testWithCliCredentials() {
  console.log('🔍 Testing with AWS CLI credentials directly\n');
  
  try {
    // Read AWS credentials file directly
    const credentialsPath = path.join(os.homedir(), '.aws', 'credentials');
    const configPath = path.join(os.homedir(), '.aws', 'config');
    
    console.log('📁 Checking AWS files:');
    console.log(`Credentials: ${fs.existsSync(credentialsPath) ? '✅' : '❌'}`);
    console.log(`Config: ${fs.existsSync(configPath) ? '✅' : '❌'}\n`);
    
    // Use AWS CLI credentials
    const client = new BedrockRuntimeClient({
      region: 'us-east-1',
      credentials: fromIni()
    });
    
    console.log('Testing Nova Lite with CLI credentials...');
    
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
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
    
    console.log('✅ SUCCESS! Nova works with CLI credentials!');
    console.log('📝 Response:', result.output.message.content[0].text);
    
    console.log('\n🎯 SOLUTION: Update your app to use CLI credentials');
    console.log('💡 The issue was credential mismatch between .env.local and AWS CLI');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    // Try with .env.local credentials but fix the format
    console.log('\n🔄 Trying with .env.local credentials...');
    await testWithEnvCredentials();
  }
}

async function testWithEnvCredentials() {
  require('dotenv').config({ path: '.env.local' });
  
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  
  try {
    // Test with a working model first
    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-tg1-large',
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
    console.log('✅ Titan works with .env.local credentials!');
    
    // Now test Nova
    const novaCommand = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
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

    const novaResponse = await client.send(novaCommand);
    console.log('✅ Nova also works!');
    
  } catch (error) {
    console.log('❌ Still failing:', error.message);
    console.log('\n💡 Try: aws configure list-profiles');
    console.log('💡 And: aws sts get-caller-identity');
  }
}

testWithCliCredentials().catch(console.error);