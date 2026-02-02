#!/usr/bin/env node

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const { fromIni } = require('@aws-sdk/credential-providers');

async function testWorkingInterviewAI() {
  console.log('🎯 Testing Working Amazon Interview AI\n');
  
  const bedrock = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: fromIni() // Use working CLI credentials
  });

  const polly = new PollyClient({
    region: 'us-east-1',
    credentials: fromIni()
  });

  try {
    // 1. Generate question with Nova
    console.log('1️⃣ Generating interview question with Nova...');
    const questionCommand = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: [{ text: 'Generate one technical React interview question about hooks.' }]
        }],
        inferenceConfig: {
          maxTokens: 150,
          temperature: 0.7
        }
      })
    });

    const questionResponse = await bedrock.send(questionCommand);
    const question = JSON.parse(new TextDecoder().decode(questionResponse.body));
    const questionText = question.output.message.content[0].text;
    
    console.log('✅ Question generated!');
    console.log(`📝 ${questionText}\n`);

    // 2. Convert to speech
    console.log('2️⃣ Converting to speech with Polly...');
    const speechCommand = new SynthesizeSpeechCommand({
      Text: questionText,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
      Engine: 'neural'
    });

    await polly.send(speechCommand);
    console.log('✅ Speech generated!\n');

    // 3. Analyze answer with Nova Pro
    console.log('3️⃣ Analyzing answer with Nova Pro...');
    const mockAnswer = "I use useState for local state like form inputs, and useEffect for side effects like API calls and subscriptions.";
    
    const analysisCommand = new InvokeModelCommand({
      modelId: 'amazon.nova-pro-v1:0',
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: [{ text: `Rate this React interview answer 1-10 and provide feedback: "${mockAnswer}"` }]
        }],
        inferenceConfig: {
          maxTokens: 200,
          temperature: 0.7
        }
      })
    });

    const analysisResponse = await bedrock.send(analysisCommand);
    const analysis = JSON.parse(new TextDecoder().decode(analysisResponse.body));
    const feedback = analysis.output.message.content[0].text;
    
    console.log('✅ Analysis complete!');
    console.log(`📊 ${feedback}\n`);

    console.log('🎉 SUCCESS! Your Amazon Interview AI is FULLY WORKING!');
    console.log('\n🚀 Working features:');
    console.log('  ✅ Question generation (Nova Lite)');
    console.log('  ✅ Voice synthesis (Polly)');
    console.log('  ✅ Answer analysis (Nova Pro)');
    console.log('  ✅ All Amazon models working!');
    
    console.log('\n💻 Your app is ready: npm run dev');
    console.log('🎯 Cost: ~$10-30/month for typical usage');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testWorkingInterviewAI().catch(console.error);