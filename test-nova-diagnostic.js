// test-nova-diagnostic.js
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function testNovaAccess() {
  console.log('🔍 Testing Nova Sonic Access...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`AWS_REGION: ${process.env.AWS_REGION || 'NOT SET'}`);
  console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET'}`);
  console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`NOVA_SONIC_MODEL_ID: ${process.env.NOVA_SONIC_MODEL_ID || 'NOT SET'}\n`);
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not configured');
    return;
  }
  
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  
  // Test basic text generation first
  console.log('🧪 Testing basic Nova Lite text generation...');
  try {
    const textPayload = {
      schemaVersion: '1.0',
      messages: [
        {
          role: 'user',
          content: [{ text: 'Say hello in exactly 5 words.' }]
        }
      ],
      inferenceConfig: {
        maxTokens: 50,
        temperature: 0.7
      }
    };
    
    const textCommand = new InvokeModelCommand({
      modelId: 'us.amazon.nova-lite-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(textPayload),
    });
    
    const textResponse = await client.send(textCommand);
    const textResult = JSON.parse(new TextDecoder().decode(textResponse.body));
    console.log('✅ Nova Lite text generation works!');
    console.log(`Response: ${textResult.output?.message?.content?.[0]?.text || 'No text response'}\n`);
  } catch (error) {
    console.error('❌ Nova Lite text generation failed:', error.message);
    if (error.name === 'AccessDeniedException') {
      console.error('   → Check your AWS credentials and Bedrock permissions');
    }
    if (error.name === 'ResourceNotFoundException') {
      console.error('   → Nova Lite model not enabled in your AWS region');
    }
    console.log('');
  }
  
  // Test Nova Sonic speech-to-speech
  console.log('🎤 Testing Nova Sonic speech-to-speech...');
  try {
    // Create a minimal audio payload (silence)
    const silenceBase64 = Buffer.from(new Array(1600).fill(0)).toString('base64');
    
    const s2sPayload = {
      schemaVersion: '1.0',
      messages: [
        {
          role: 'user',
          content: [
            {
              audio: {
                data: silenceBase64,
                mediaType: 'audio/wav'
              }
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 100,
        temperature: 0.7
      },
      outputModalities: ['text', 'audio'],
      audioOutputConfig: {
        codec: 'mp3',
        voiceId: 'Matthew',
        sampleRate: 24000
      }
    };
    
    const s2sCommand = new InvokeModelCommand({
      modelId: process.env.NOVA_SONIC_MODEL_ID || 'us.amazon.nova-2-sonic-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(s2sPayload),
    });
    
    const s2sResponse = await client.send(s2sCommand);
    const s2sResult = JSON.parse(new TextDecoder().decode(s2sResponse.body));
    
    console.log('✅ Nova Sonic speech-to-speech works!');
    console.log(`Text response: ${s2sResult.output?.message?.content?.[0]?.text || 'No text'}`);
    console.log(`Audio response: ${s2sResult.output?.message?.content?.[1]?.audio ? 'Present' : 'Missing'}`);
    console.log(`Input transcription: ${s2sResult.inputTranscription || 'Not available'}\n`);
    
  } catch (error) {
    console.error('❌ Nova Sonic speech-to-speech failed:', error.message);
    if (error.name === 'AccessDeniedException') {
      console.error('   → Check Bedrock permissions for Nova Sonic model');
    }
    if (error.name === 'ResourceNotFoundException') {
      console.error('   → Nova Sonic model not enabled in your AWS region');
      console.error('   → Go to AWS Bedrock console and enable Nova Sonic');
    }
    if (error.name === 'ValidationException') {
      console.error('   → Invalid payload format or parameters');
    }
    console.log('');
  }
  
  console.log('🔧 Troubleshooting Tips:');
  console.log('1. Ensure Nova models are enabled in AWS Bedrock console');
  console.log('2. Check your AWS region supports Nova models');
  console.log('3. Verify IAM permissions include bedrock:InvokeModel');
  console.log('4. Try running: npm run dev and visit /test-speech');
}

testNovaAccess().catch(console.error);