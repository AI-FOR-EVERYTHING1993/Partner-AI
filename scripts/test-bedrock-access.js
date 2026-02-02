#!/usr/bin/env node

/**
 * 🧪 AWS Bedrock Access Tester
 * Tests your current Bedrock model access and configuration
 */

const { BedrockRuntimeClient, InvokeModelCommand, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock-runtime');
const { BedrockClient } = require('@aws-sdk/client-bedrock');
require('dotenv').config({ path: '.env.local' });

class BedrockAccessTester {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };

    this.bedrockRuntime = new BedrockRuntimeClient({
      region: this.region,
      credentials: this.credentials
    });

    this.bedrock = new BedrockClient({
      region: this.region,
      credentials: this.credentials
    });
  }

  async testAccess() {
    console.log('🚀 Testing AWS Bedrock Access\n');
    console.log(`Region: ${this.region}`);
    console.log(`Access Key: ${this.credentials.accessKeyId?.substring(0, 8)}...`);
    console.log('─'.repeat(50));

    try {
      // Test 1: List available models
      await this.listAvailableModels();
      
      // Test 2: Test specific models from your config
      await this.testConfiguredModels();
      
      // Test 3: Test voice models for interview practice
      await this.testVoiceModels();
      
      console.log('\n✅ Bedrock access test completed!');
      
    } catch (error) {
      console.error('\n❌ Bedrock access test failed:', error.message);
      this.provideTroubleshootingTips();
    }
  }

  async listAvailableModels() {
    console.log('\n📋 Listing Available Foundation Models...');
    
    try {
      const command = new ListFoundationModelsCommand({});
      const response = await this.bedrock.send(command);
      
      const models = response.modelSummaries || [];
      console.log(`Found ${models.length} available models:`);
      
      // Group by provider
      const providers = {};
      models.forEach(model => {
        const provider = model.providerName;
        if (!providers[provider]) providers[provider] = [];
        providers[provider].push(model);
      });

      Object.entries(providers).forEach(([provider, providerModels]) => {
        console.log(`\n🏢 ${provider}:`);
        providerModels.forEach(model => {
          const status = model.modelLifecycle?.status || 'ACTIVE';
          const icon = status === 'ACTIVE' ? '✅' : '⚠️';
          console.log(`  ${icon} ${model.modelId} (${model.modelName})`);
        });
      });

    } catch (error) {
      console.error('❌ Failed to list models:', error.message);
    }
  }

  async testConfiguredModels() {
    console.log('\n🎯 Testing Your Configured Models...');
    
    const modelsToTest = [
      {
        name: 'Claude 3.5 Sonnet',
        id: process.env.CLAUDE_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        testPrompt: 'Analyze this resume briefly: Software Engineer with 3 years experience in React and Node.js.'
      },
      {
        name: 'Nova Pro',
        id: process.env.NOVA_PRO_MODEL_ID || 'us.amazon.nova-pro-v1:0',
        testPrompt: 'Rate this interview answer from 1-10: "I have experience with JavaScript and I like coding."'
      },
      {
        name: 'Nova Sonic',
        id: process.env.NOVA_SONIC_MODEL_ID || 'us.amazon.nova-2-sonic-v1:0',
        testPrompt: 'Give me one technical interview question for a React developer.'
      }
    ];

    for (const model of modelsToTest) {
      await this.testModel(model);
    }
  }

  async testModel(model) {
    console.log(`\n🧪 Testing ${model.name} (${model.id})...`);
    
    try {
      const payload = {
        messages: [
          {
            role: 'user',
            content: model.testPrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      };

      const command = new InvokeModelCommand({
        modelId: model.id,
        contentType: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await this.bedrockRuntime.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ ${model.name} - Working!`);
      console.log(`📝 Sample response: ${responseBody.content?.[0]?.text?.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ ${model.name} - Failed: ${error.message}`);
      
      if (error.message.includes('ValidationException')) {
        console.log(`   💡 Tip: Model might not be available in ${this.region}`);
      } else if (error.message.includes('AccessDeniedException')) {
        console.log(`   💡 Tip: Check IAM permissions for bedrock:InvokeModel`);
      }
    }
  }

  async testVoiceModels() {
    console.log('\n🎤 Checking Voice/Audio Models for Interview Practice...');
    
    // Note: Nova models can handle voice, but for true voice interaction
    // you might want to combine with Polly or other services
    console.log('📝 For voice interviews, you can use:');
    console.log('  ✅ Nova models for text-based conversation');
    console.log('  ✅ Amazon Polly for text-to-speech');
    console.log('  ✅ Amazon Transcribe for speech-to-text');
    console.log('  ✅ Streaming responses for real-time interaction');
  }

  provideTroubleshootingTips() {
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('');
    console.log('1. 🔑 Check AWS Credentials:');
    console.log('   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local');
    console.log('   - Ensure credentials have bedrock permissions');
    console.log('');
    console.log('2. 🌍 Check Region:');
    console.log('   - Bedrock models are region-specific');
    console.log('   - Try us-east-1 or us-west-2 for best model availability');
    console.log('');
    console.log('3. 🔐 Required IAM Permissions:');
    console.log('   - bedrock:InvokeModel');
    console.log('   - bedrock:InvokeModelWithResponseStream');
    console.log('   - bedrock:ListFoundationModels');
    console.log('');
    console.log('4. 🎯 Model Access:');
    console.log('   - Some models require explicit access request');
    console.log('   - Check AWS Console > Bedrock > Model Access');
    console.log('');
    console.log('5. 💰 Billing:');
    console.log('   - Ensure your AWS account has valid payment method');
    console.log('   - Check for any service limits or restrictions');
  }
}

// Run the test
const tester = new BedrockAccessTester();
tester.testAccess().catch(console.error);