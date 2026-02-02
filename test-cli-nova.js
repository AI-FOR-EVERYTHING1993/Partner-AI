#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testWithCLI() {
  console.log('🔍 Testing Nova with AWS CLI (same creds that work)\n');

  // Test Nova with CLI format
  const testPayload = {
    messages: [{
      role: 'user',
      content: [{ text: 'Generate one React interview question.' }]
    }],
    inferenceConfig: {
      maxTokens: 100,
      temperature: 0.7
    }
  };

  try {
    // Write payload to temp file
    require('fs').writeFileSync('nova-test.json', JSON.stringify(testPayload));
    
    console.log('Testing amazon.nova-lite-v1:0 with CLI...');
    
    const { stdout, stderr } = await execAsync(
      'aws bedrock-runtime invoke-model --region us-east-1 --model-id "amazon.nova-lite-v1:0" --content-type "application/json" --body file://nova-test.json nova-output.json'
    );
    
    if (stderr) {
      console.log('❌ CLI Error:', stderr);
    } else {
      console.log('✅ CLI Success!');
      
      // Read the output
      const output = require('fs').readFileSync('nova-output.json', 'utf8');
      const result = JSON.parse(output);
      console.log('📝 Response:', result.output.message.content[0].text);
      
      console.log('\n🎉 Nova works with CLI! Issue is in Node.js SDK setup');
      console.log('💡 Let me fix the SDK configuration...');
    }
    
  } catch (error) {
    console.log('❌ CLI Test failed:', error.message);
    
    if (error.message.includes('INVALID_PAYMENT_INSTRUMENT')) {
      console.log('💳 Payment method issue - contact AWS admin');
    } else if (error.message.includes('AccessDenied')) {
      console.log('🔐 Permission issue - need bedrock:InvokeModel');
    } else {
      console.log('🔍 Unknown issue - checking SDK version...');
    }
  }
}

testWithCLI().catch(console.error);