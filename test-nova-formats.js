#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function testNovaFormats() {
  console.log('🔍 Testing Nova with different request formats\n');
  
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Try different Nova request formats
  const formats = [
    {
      name: 'Format 1: Simple text',
      body: {
        inputText: 'Generate one React interview question.',
        textGenerationConfig: {
          maxTokenCount: 100,
          temperature: 0.7
        }
      }
    },
    {
      name: 'Format 2: Messages array',
      body: {
        messages: [{
          role: 'user',
          content: 'Generate one React interview question.'
        }],
        max_tokens: 100,
        temperature: 0.7
      }
    },
    {
      name: 'Format 3: Nova specific',
      body: {
        prompt: 'Generate one React interview question.',
        max_tokens: 100,
        temperature: 0.7
      }
    },
    {
      name: 'Format 4: Anthropic-style for Nova',
      body: {
        messages: [{
          role: 'user',
          content: [{ text: 'Generate one React interview question.' }]
        }],
        inferenceConfig: {
          maxTokens: 100,
          temperature: 0.7
        }
      }
    }
  ];

  for (const format of formats) {
    console.log(`Testing ${format.name}...`);
    
    try {
      const command = new InvokeModelCommand({
        modelId: 'amazon.nova-lite-v1:0',
        contentType: 'application/json',
        body: JSON.stringify(format.body)
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ ${format.name} - WORKS!`);
      console.log(`📝 Response: ${JSON.stringify(result, null, 2).substring(0, 200)}...\n`);
      
      // Found working format!
      return format;
      
    } catch (error) {
      console.log(`❌ ${format.name} - ${error.message.substring(0, 80)}...\n`);
    }
  }
  
  console.log('🔍 None of the formats worked. Checking model availability...');
}

testNovaFormats().then(workingFormat => {
  if (workingFormat) {
    console.log('🎉 Found working format! Updating your code...');
  }
}).catch(console.error);