#!/usr/bin/env node

/**
 * 🎯 Simple Bedrock Test for Interview Prep AI
 * Run this after requesting model access in AWS Console
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config({ path: '.env.local' });

async function testBedrockForInterviewPrep() {
  console.log('🎯 Testing Bedrock for Interview Prep AI\n');

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  // Test scenarios for your interview prep app
  const tests = [
    {
      name: '📄 Resume Analysis',
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      prompt: 'Analyze this resume briefly and give 3 improvement tips: "Software Engineer with 3 years React, Node.js, AWS experience. Built 5 web applications."'
    },
    {
      name: '❓ Interview Question Generation', 
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      prompt: 'Generate 1 technical interview question for a React developer position.'
    },
    {
      name: '📊 Performance Feedback',
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0', 
      prompt: 'Rate this interview answer 1-10 and explain: "I would use useState for local state and useEffect for side effects in React."'
    }
  ];

  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    
    try {
      const payload = {
        messages: [{
          role: 'user',
          content: [{ text: test.prompt }]
        }],
        inferenceConfig: {
          maxTokens: 200,
          temperature: 0.7
        }
      };

      const command = new InvokeModelCommand({
        modelId: test.modelId,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      if (result.output?.message?.content?.[0]?.text) {
        const answer = result.output.message.content[0].text;
        console.log(`✅ ${test.name} - SUCCESS!`);
        console.log(`📝 Response: ${answer.substring(0, 150)}...\n`);
      } else {
        console.log(`❌ ${test.name} - Unexpected response format\n`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED: ${error.message}`);
      
      if (error.message.includes('ValidationException')) {
        console.log('💡 Tip: Check model ID and request format');
      } else if (error.message.includes('AccessDeniedException')) {
        console.log('💡 Tip: Request model access in AWS Console > Bedrock > Model Access');
      } else if (error.message.includes('Authentication')) {
        console.log('💡 Tip: Go to AWS Console > Bedrock > Model Access and request access to Anthropic Claude models');
      }
      console.log('');
    }
  }

  console.log('🎉 Test completed!');
  console.log('\n📋 Next steps if tests failed:');
  console.log('1. Go to AWS Console > Amazon Bedrock > Model Access');
  console.log('2. Request access to Anthropic Claude 3 Haiku');
  console.log('3. Wait for approval (usually instant)');
  console.log('4. Run this test again');
  console.log('\n🚀 If tests passed, start your app with: npm run dev');
}

testBedrockForInterviewPrep().catch(console.error);