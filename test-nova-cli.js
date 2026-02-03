// test-nova-cli.js
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { fromNodeProviderChain } = require('@aws-sdk/credential-providers');

async function testNovaWithCLI() {
  console.log('🔍 Testing Nova with AWS CLI credentials...\n');
  
  const client = new BedrockRuntimeClient({
    region: 'us-east-1',
    credentials: fromNodeProviderChain()
  });
  
  // Test Nova Lite first
  console.log('🧪 Testing Nova Lite...');
  try {
    const payload = {
      messages: [{ role: 'user', content: [{ text: 'Say hello in 5 words' }] }],
      inferenceConfig: { maxTokens: 50, temperature: 0.7 }
    };
    
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });
    
    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    console.log('✅ Nova Lite works!');
    console.log(`Response: ${result.output?.message?.content?.[0]?.text}\n`);
  } catch (error) {
    console.error('❌ Nova Lite failed:', error.message);
    console.log('');
  }
  
  // Test Nova Sonic
  console.log('🎤 Testing Nova Sonic...');
  try {
    const silenceBase64 = Buffer.from(new Array(1600).fill(0)).toString('base64');
    
    const payload = {
      messages: [{
        role: 'user',
        content: [{
          audio: {
            data: silenceBase64,
            mediaType: 'audio/wav'
          }
        }]
      }],
      inferenceConfig: { maxTokens: 100, temperature: 0.7 },
      outputModalities: ['text', 'audio'],
      audioOutputConfig: {
        codec: 'mp3',
        voiceId: 'Matthew',
        sampleRate: 24000
      }
    };
    
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-sonic-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });
    
    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ Nova Sonic works!');
    console.log(`Text: ${result.output?.message?.content?.[0]?.text || 'No text'}`);
    console.log(`Audio: ${result.output?.message?.content?.[1]?.audio ? 'Present' : 'Missing'}`);
    console.log(`Transcription: ${result.inputTranscription || 'None'}\n`);
    
  } catch (error) {
    console.error('❌ Nova Sonic failed:', error.message);
    if (error.name === 'ResourceNotFoundException') {
      console.error('   → Nova Sonic not enabled in Bedrock console');
    }
    console.log('');
  }
}

testNovaWithCLI().catch(console.error);