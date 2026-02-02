#!/usr/bin/env node

/**
 * 🚀 Complete AWS Bedrock Setup & Test for Interview Prep AI
 * This script will configure and test your Bedrock access
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

class InterviewPrepBedrockSetup {
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

    // Working models for your interview prep AI
    this.workingModels = {
      'Claude 3 Haiku': 'anthropic.claude-3-haiku-20240307-v1:0',
      'Claude 3.5 Sonnet': 'anthropic.claude-3-5-sonnet-20240620-v1:0', 
      'Llama 3.1 8B': 'meta.llama3-1-8b-instruct-v1:0',
      'Titan Embeddings': 'amazon.titan-embed-text-v2:0',
      'Command R': 'cohere.command-r-v1:0'
    };
  }

  async setup() {
    console.log('🎯 AWS Bedrock Setup for Interview Prep AI');
    console.log('=' .repeat(50));
    
    try {
      // Step 1: Verify credentials
      await this.verifyCredentials();
      
      // Step 2: Test model access
      await this.testModelAccess();
      
      // Step 3: Test interview-specific functionality
      await this.testInterviewFeatures();
      
      // Step 4: Update configuration
      await this.updateConfiguration();
      
      // Step 5: Provide next steps
      this.provideNextSteps();
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      this.provideTroubleshootingTips();
    }
  }

  async verifyCredentials() {
    console.log('\\n🔐 Verifying AWS Credentials...');
    
    if (!this.credentials.accessKeyId || !this.credentials.secretAccessKey) {
      throw new Error('AWS credentials not found in .env.local');
    }
    
    console.log(`✅ Region: ${this.region}`);
    console.log(`✅ Access Key: ${this.credentials.accessKeyId.substring(0, 8)}...`);
  }

  async testModelAccess() {
    console.log('\\n🧪 Testing Model Access...');
    
    const testPrompts = {
      'resume_analysis': 'Analyze this resume briefly: Software Engineer with 3 years React experience.',
      'interview_question': 'Generate one technical interview question for a React developer.',
      'feedback': 'Rate this answer 1-10: "I have experience with JavaScript and React hooks."'
    };

    for (const [modelName, modelId] of Object.entries(this.workingModels)) {
      if (modelName === 'Titan Embeddings') continue; // Skip embedding model
      
      console.log(`\\n🔍 Testing ${modelName}...`);
      
      try {
        const testResult = await this.testModel(modelId, testPrompts.interview_question);
        console.log(`✅ ${modelName} - Working!`);
        console.log(`📝 Sample: ${testResult.substring(0, 80)}...`);
        
        // Test with interview-specific prompt
        const interviewResult = await this.testModel(modelId, testPrompts.resume_analysis);
        console.log(`🎯 Interview feature test: ${interviewResult.substring(0, 60)}...`);
        
      } catch (error) {
        console.log(`❌ ${modelName} - Failed: ${error.message}`);
      }
    }
  }

  async testModel(modelId, prompt) {
    const payload = {
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }]
        }
      ],
      inferenceConfig: {
        maxTokens: 100,
        temperature: 0.7
      }
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await this.bedrockRuntime.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    if (result.output && result.output.message && result.output.message.content) {
      return result.output.message.content[0].text;
    }
    
    throw new Error('Invalid response format');
  }

  async testInterviewFeatures() {
    console.log('\\n🎤 Testing Interview Prep Features...');
    
    const features = [
      {
        name: 'Resume Analysis',
        prompt: 'Analyze this resume for ATS compatibility and provide 3 improvement suggestions: Software Engineer with React, Node.js, and AWS experience.',
        expectedKeywords: ['ATS', 'improvement', 'suggestions']
      },
      {
        name: 'Interview Questions',
        prompt: 'Generate 2 behavioral interview questions for a senior software engineer position.',
        expectedKeywords: ['behavioral', 'question', 'senior']
      },
      {
        name: 'Performance Feedback',
        prompt: 'Evaluate this interview answer and provide feedback: "I solved the problem using a hash map to optimize the time complexity from O(n²) to O(n)."',
        expectedKeywords: ['feedback', 'evaluation', 'performance']
      }
    ];

    const workingModelId = 'anthropic.claude-3-haiku-20240307-v1:0';
    
    for (const feature of features) {
      console.log(`\\n🔍 Testing ${feature.name}...`);
      
      try {
        const result = await this.testModel(workingModelId, feature.prompt);
        const hasExpectedContent = feature.expectedKeywords.some(keyword => 
          result.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasExpectedContent) {
          console.log(`✅ ${feature.name} - Working correctly`);
        } else {
          console.log(`⚠️ ${feature.name} - Response may need tuning`);
        }
        
        console.log(`📝 Sample: ${result.substring(0, 100)}...`);
        
      } catch (error) {
        console.log(`❌ ${feature.name} - Failed: ${error.message}`);
      }
    }
  }

  async updateConfiguration() {
    console.log('\\n⚙️ Updating Configuration...');
    
    const envPath = '.env.local';
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update with working model IDs
    const updates = {
      'CLAUDE_MODEL_ID': 'anthropic.claude-3-haiku-20240307-v1:0',
      'CLAUDE_SONNET_MODEL_ID': 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      'LLAMA_MODEL_ID': 'meta.llama3-1-8b-instruct-v1:0',
      'TITAN_EMBED_MODEL_ID': 'amazon.titan-embed-text-v2:0',
      'COMMAND_R_MODEL_ID': 'cohere.command-r-v1:0'
    };
    
    for (const [key, value] of Object.entries(updates)) {
      envContent = this.updateEnvVar(envContent, key, value);
    }
    
    // Add interview-specific configuration
    const interviewConfig = `
# Interview Prep AI Configuration
INTERVIEW_DEFAULT_MODEL=anthropic.claude-3-haiku-20240307-v1:0
RESUME_ANALYSIS_MODEL=anthropic.claude-3-5-sonnet-20240620-v1:0
FEEDBACK_MODEL=cohere.command-r-v1:0
EMBEDDING_MODEL=amazon.titan-embed-text-v2:0

# Voice & Audio (for future implementation)
POLLY_VOICE_ID=Joanna
TRANSCRIBE_LANGUAGE=en-US
`;
    
    if (!envContent.includes('# Interview Prep AI Configuration')) {
      envContent += interviewConfig;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Configuration updated successfully');
  }

  updateEnvVar(content, varName, value) {
    const regex = new RegExp(`^${varName}=.*$`, 'm');
    const newLine = `${varName}=${value}`;
    
    if (regex.test(content)) {
      return content.replace(regex, newLine);
    } else {
      return content + (content.endsWith('\\n') ? '' : '\\n') + newLine + '\\n';
    }
  }

  provideNextSteps() {
    console.log('\\n🎉 Setup Complete! Next Steps:');
    console.log('');
    console.log('1. 🚀 Start your development server:');
    console.log('   npm run dev');
    console.log('');
    console.log('2. 🧪 Test the features:');
    console.log('   - Upload a resume for analysis');
    console.log('   - Start an interview simulation');
    console.log('   - Try the voice practice (if implemented)');
    console.log('');
    console.log('3. 💰 Monitor costs:');
    console.log('   - Check AWS Billing Dashboard');
    console.log('   - Set up CloudWatch alarms');
    console.log('');
    console.log('4. 🔧 Optimize performance:');
    console.log('   - Use Claude Haiku for quick responses');
    console.log('   - Use Claude Sonnet for detailed analysis');
    console.log('   - Implement response caching');
    console.log('');
    console.log('📊 Estimated costs for typical usage:');
    console.log('   - Resume analysis: ~$0.10-0.30 per resume');
    console.log('   - Interview simulation: ~$0.05-0.15 per session');
    console.log('   - Monthly estimate (100 resumes + 50 interviews): ~$15-50');
  }

  provideTroubleshootingTips() {
    console.log('\\n🔧 Troubleshooting Tips:');
    console.log('');
    console.log('1. 🔑 Credentials Issues:');
    console.log('   - Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local');
    console.log('   - Check IAM permissions: bedrock:InvokeModel, bedrock:ListFoundationModels');
    console.log('');
    console.log('2. 🌍 Region Issues:');
    console.log('   - Try us-east-1 or us-west-2 for best model availability');
    console.log('   - Some models are region-specific');
    console.log('');
    console.log('3. 🎯 Model Access:');
    console.log('   - Go to AWS Console > Bedrock > Model Access');
    console.log('   - Request access to Anthropic Claude models');
    console.log('   - Access is usually granted instantly for most models');
    console.log('');
    console.log('4. 💳 Billing:');
    console.log('   - Ensure valid payment method in AWS account');
    console.log('   - Check for any account restrictions');
  }
}

// Run the setup
const setup = new InterviewPrepBedrockSetup();
setup.setup().catch(console.error);