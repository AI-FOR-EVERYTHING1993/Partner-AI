#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { fromNodeProviderChain } = require('@aws-sdk/credential-providers');

async function testWithCliCredentials() {
  console.log('🔍 Testing with AWS CLI Credentials...\n');
  
  try {
    // Use the same credential provider as AWS CLI
    const client = new BedrockRuntimeClient({
      region: 'us-east-1',
      credentials: fromNodeProviderChain()
    });
    
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
    
    console.log('✅ SUCCESS! Bedrock is working!');
    console.log('📝 Response:', result.output.message.content[0].text);
    
    // Test your interview prep models
    await testInterviewModels(client);
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
    console.log('Error details:', error);
  }
}

async function testInterviewModels(client) {
  console.log('\n🎯 Testing Interview Prep Models...\n');
  
  const models = [
    'anthropic.claude-3-haiku-20240307-v1:0',
    'anthropic.claude-3-5-sonnet-20240620-v1:0',
    'meta.llama3-1-8b-instruct-v1:0',
    'cohere.command-r-v1:0'
  ];
  
  for (const modelId of models) {
    try {
      const command = new InvokeModelCommand({
        modelId,
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
      console.log(`✅ ${modelId} - Working!`);
      
    } catch (error) {
      console.log(`❌ ${modelId} - Failed: ${error.message}`);
    }
  }
}

testWithCliCredentials().catch(console.error);