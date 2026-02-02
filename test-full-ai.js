#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
require('dotenv').config({ path: '.env.local' });

async function testFullInterviewAI() {
  console.log('🎯 Testing Complete Amazon Interview AI Stack\n');
  
  const bedrock = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const polly = new PollyClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Test interview workflow
  console.log('🧪 Testing Interview AI Workflow...\n');

  try {
    // 1. Generate interview question with Nova
    console.log('1️⃣ Generating interview question...');
    const questionCommand = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: [{ text: 'Generate one technical React interview question.' }]
        }],
        inferenceConfig: { maxTokens: 100, temperature: 0.7 }
      })
    });

    const questionResponse = await bedrock.send(questionCommand);
    const question = JSON.parse(new TextDecoder().decode(questionResponse.body));
    const questionText = question.output.message.content[0].text;
    
    console.log('✅ Question generated!');
    console.log(`📝 ${questionText.substring(0, 100)}...\n`);

    // 2. Convert to speech with Polly
    console.log('2️⃣ Converting to speech...');
    const speechCommand = new SynthesizeSpeechCommand({
      Text: questionText,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
      Engine: 'neural'
    });

    const speechResponse = await polly.send(speechCommand);
    console.log('✅ Speech generated!\n');

    // 3. Analyze mock answer with Nova Pro
    console.log('3️⃣ Analyzing mock answer...');
    const mockAnswer = "I would use useState for managing local component state and useEffect for handling side effects like API calls.";
    
    const analysisCommand = new InvokeModelCommand({
      modelId: 'amazon.nova-pro-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: [{ text: `Rate this React interview answer 1-10 and provide feedback: "${mockAnswer}"` }]
        }],
        inferenceConfig: { maxTokens: 150, temperature: 0.7 }
      })
    });

    const analysisResponse = await bedrock.send(analysisCommand);
    const analysis = JSON.parse(new TextDecoder().decode(analysisResponse.body));
    const feedback = analysis.output.message.content[0].text;
    
    console.log('✅ Analysis complete!');
    console.log(`📊 ${feedback.substring(0, 100)}...\n`);

    console.log('🎉 SUCCESS! Your Amazon Interview AI is fully operational!');
    console.log('\n🚀 Features working:');
    console.log('  ✅ Question generation (Nova Lite)');
    console.log('  ✅ Voice synthesis (Polly)');
    console.log('  ✅ Answer analysis (Nova Pro)');
    console.log('  ✅ All Amazon ecosystem!');
    
    console.log('\n💻 Ready to run: npm run dev');

  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('AccessDenied') || error.message.includes('Authentication')) {
      console.log('\n💡 Model access not yet granted. Please:');
      console.log('1. Complete the AWS Console steps');
      console.log('2. Wait 1-2 minutes for propagation');
      console.log('3. Run this test again');
    }
  }
}

testFullInterviewAI().catch(console.error);