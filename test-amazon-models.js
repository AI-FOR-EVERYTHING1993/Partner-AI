#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function testAmazonModels() {
  console.log('🚀 Testing Amazon Models for Interview AI\n');
  
  const bedrockClient = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const pollyClient = new PollyClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Test Nova models for interview features
  const novaModels = [
    { id: 'amazon.nova-micro-v1:0', name: 'Nova Micro (Fast/Cheap)', use: 'Quick responses' },
    { id: 'amazon.nova-lite-v1:0', name: 'Nova Lite (Balanced)', use: 'General chat' },
    { id: 'amazon.nova-pro-v1:0', name: 'Nova Pro (Advanced)', use: 'Resume analysis' },
    { id: 'amazon.nova-2-sonic-v1:0', name: 'Nova 2 Sonic (Latest)', use: 'Best performance' }
  ];

  let workingModel = null;

  for (const model of novaModels) {
    console.log(`Testing ${model.name}...`);
    
    try {
      const command = new InvokeModelCommand({
        modelId: model.id,
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

      const response = await bedrockClient.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ ${model.name} - WORKS!`);
      console.log(`📝 Sample: ${result.output.message.content[0].text.substring(0, 80)}...`);
      console.log(`🎯 Use for: ${model.use}\n`);
      
      if (!workingModel) workingModel = model.id;
      
    } catch (error) {
      console.log(`❌ ${model.name} - ${error.message.substring(0, 50)}...\n`);
    }
  }

  // Test Polly for voice
  console.log('🎤 Testing Amazon Polly...');
  try {
    const pollyCommand = new SynthesizeSpeechCommand({
      Text: 'Hello! Welcome to your interview preparation session.',
      OutputFormat: 'mp3',
      VoiceId: 'Joanna'
    });

    const pollyResponse = await pollyClient.send(pollyCommand);
    console.log('✅ Polly - WORKS! Voice synthesis ready');
    
    // Save sample audio
    const audioBuffer = Buffer.from(await pollyResponse.AudioStream.transformToByteArray());
    fs.writeFileSync('test-voice.mp3', audioBuffer);
    console.log('📁 Saved test-voice.mp3\n');
    
  } catch (error) {
    console.log(`❌ Polly - ${error.message}\n`);
  }

  // Test embeddings
  console.log('🔍 Testing Titan Embeddings...');
  try {
    const embedCommand = new InvokeModelCommand({
      modelId: 'amazon.titan-embed-text-v2:0',
      contentType: 'application/json',
      body: JSON.stringify({
        inputText: 'Software engineer with React experience'
      })
    });

    const embedResponse = await bedrockClient.send(embedCommand);
    console.log('✅ Titan Embeddings - WORKS! Resume matching ready\n');
    
  } catch (error) {
    console.log(`❌ Titan Embeddings - ${error.message}\n`);
  }

  if (workingModel) {
    console.log('🎉 SUCCESS! Your Amazon-only interview AI is ready!');
    console.log(`\n📋 Update your .env.local:`);
    console.log(`NOVA_MODEL_ID=${workingModel}`);
    console.log(`EMBEDDING_MODEL_ID=amazon.titan-embed-text-v2:0`);
    console.log(`POLLY_VOICE_ID=Joanna`);
  }
}

testAmazonModels().catch(console.error);