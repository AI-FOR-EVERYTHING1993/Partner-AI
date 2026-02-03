// test-timeout.js
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { fromNodeProviderChain } = require('@aws-sdk/credential-providers');

async function testTimeout() {
  console.log('🕐 Testing timeout settings...\n');
  
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: fromNodeProviderChain(),
    requestHandler: {
      requestTimeout: 60000, // 60 seconds
      connectionTimeout: 10000, // 10 seconds
    },
  });
  
  const start = Date.now();
  
  try {
    const payload = {
      messages: [{ 
        role: 'user', 
        content: [{ text: 'Write a detailed explanation of machine learning in exactly 200 words.' }] 
      }],
      inferenceConfig: { maxTokens: 300, temperature: 0.7 }
    };
    
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });
    
    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const duration = Date.now() - start;
    
    console.log(`✅ Request completed in ${duration}ms`);
    console.log(`Response length: ${result.output?.message?.content?.[0]?.text?.length || 0} characters`);
    
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Request failed after ${duration}ms:`, error.message);
  }
}

testTimeout().catch(console.error);