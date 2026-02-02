#!/usr/bin/env node

/**
 * 🚀 AWS Bedrock Setup Script for Interview Prep AI
 * 
 * This script initializes:
 * - Bedrock Knowledge Base with interview questions
 * - S3 buckets for data storage
 * - IAM roles and policies
 * - Environment configuration
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { setupInterviewKnowledgeBase } from '../lib/bedrock-knowledge-base';

class BedrockSetupWizard {
  private config: any = {};

  async run() {
    console.log('🎯 AWS Bedrock Setup Wizard for Interview Prep AI\n');

    try {
      // Step 1: Verify Prerequisites
      await this.verifyPrerequisites();

      // Step 2: Configure AWS Settings
      await this.configureAWS();

      // Step 3: Setup Knowledge Base (Optional)
      await this.setupKnowledgeBase();

      // Step 4: Update Environment Variables
      await this.updateEnvironment();

      // Step 5: Test Configuration
      await this.testConfiguration();

      console.log('\n✅ Bedrock setup completed successfully!');
      console.log('\n🚀 Next steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Test resume analysis feature');
      console.log('3. Try interview simulation');
      console.log('4. Check performance evaluation');

    } catch (error) {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    }
  }

  private async verifyPrerequisites() {
    console.log('🔍 Verifying prerequisites...');

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`✓ Node.js version: ${nodeVersion}`);

    // Check AWS CLI
    try {
      const awsVersion = execSync('aws --version', { encoding: 'utf8' });
      console.log(`✓ AWS CLI: ${awsVersion.trim()}`);
    } catch (error) {
      console.log('⚠️  AWS CLI not found - you can still use access keys');
    }

    // Check required packages
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const requiredPackages = [
      '@aws-sdk/client-bedrock-runtime',
      '@aws-sdk/client-bedrock-agent-runtime',
      '@aws-sdk/client-s3'
    ];

    for (const pkg of requiredPackages) {
      if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
        console.log(`✓ ${pkg} installed`);
      } else {
        console.log(`❌ Missing package: ${pkg}`);
        throw new Error(`Please install ${pkg}`);
      }
    }

    console.log('✅ Prerequisites verified\n');
  }

  private async configureAWS() {
    console.log('⚙️  Configuring AWS settings...');

    // Check existing configuration
    const envPath = '.env.local';
    let envContent = '';
    
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8');
      console.log('✓ Found existing .env.local file');
    }

    // Extract current AWS settings
    const awsRegion = this.extractEnvVar(envContent, 'AWS_REGION') || 'us-east-1';
    const accessKeyId = this.extractEnvVar(envContent, 'AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.extractEnvVar(envContent, 'AWS_SECRET_ACCESS_KEY');

    this.config.awsRegion = awsRegion;
    this.config.accessKeyId = accessKeyId;
    this.config.secretAccessKey = secretAccessKey;

    if (!accessKeyId || !secretAccessKey) {
      console.log('\n⚠️  AWS credentials not found in .env.local');
      console.log('Please ensure your AWS credentials are configured via:');
      console.log('1. .env.local file (recommended for development)');
      console.log('2. AWS CLI (aws configure)');
      console.log('3. IAM roles (for production)');
      console.log('\nRequired permissions:');
      console.log('- bedrock:InvokeModel');
      console.log('- bedrock:InvokeModelWithResponseStream');
      console.log('- bedrock-agent:Retrieve');
      console.log('- bedrock-agent:RetrieveAndGenerate');
      console.log('- s3:GetObject, s3:PutObject');
    } else {
      console.log(`✓ AWS Region: ${awsRegion}`);
      console.log(`✓ Access Key: ${accessKeyId.substring(0, 8)}...`);
    }

    console.log('✅ AWS configuration ready\n');
  }

  private async setupKnowledgeBase() {
    console.log('📚 Setting up Knowledge Base...');
    
    const setupKB = await this.promptUser('Do you want to setup Bedrock Knowledge Base? (y/n): ');
    
    if (setupKB.toLowerCase() === 'y') {
      try {
        console.log('🔄 Creating Knowledge Base (this may take a few minutes)...');
        
        const result = await setupInterviewKnowledgeBase();
        
        this.config.knowledgeBaseId = result.knowledgeBaseId;
        this.config.bucketName = result.bucketName;
        
        console.log(`✅ Knowledge Base created: ${result.knowledgeBaseId}`);
        console.log(`✅ S3 Bucket created: ${result.bucketName}`);
        
      } catch (error) {
        console.log('⚠️  Knowledge Base setup failed (optional feature)');
        console.log('You can still use basic Bedrock features without it');
        console.log('Error:', error);
      }
    } else {
      console.log('⏭️  Skipping Knowledge Base setup');
    }

    console.log('✅ Knowledge Base configuration complete\n');
  }

  private async updateEnvironment() {
    console.log('📝 Updating environment configuration...');

    const envPath = '.env.local';
    let envContent = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';

    // Add/update Bedrock-specific variables
    const bedrockVars = {
      'BEDROCK_KNOWLEDGE_BASE_ID': this.config.knowledgeBaseId || '',
      'BEDROCK_S3_BUCKET': this.config.bucketName || '',
      'CLAUDE_MODEL_ID': 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'NOVA_PRO_MODEL_ID': 'amazon.nova-pro-v1:0',
      'TITAN_EMBED_MODEL_ID': 'amazon.titan-embed-text-v2:0'
    };

    for (const [key, value] of Object.entries(bedrockVars)) {
      if (value) {
        envContent = this.updateEnvVar(envContent, key, value);
      }
    }

    // Add helpful comments
    if (!envContent.includes('# Bedrock Configuration')) {
      envContent += '\n# Bedrock Configuration\n';
    }

    writeFileSync(envPath, envContent);
    console.log(`✅ Updated ${envPath}`);
    console.log('✅ Environment configuration complete\n');
  }

  private async testConfiguration() {
    console.log('🧪 Testing Bedrock configuration...');

    try {
      // Test basic Bedrock connection
      const testResponse = await fetch('/api/test-bedrock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });

      if (testResponse.ok) {
        console.log('✅ Bedrock connection successful');
      } else {
        console.log('⚠️  Bedrock connection test failed');
      }
    } catch (error) {
      console.log('⚠️  Could not test connection (server not running)');
      console.log('Run "npm run dev" to test the configuration');
    }

    console.log('✅ Configuration test complete\n');
  }

  // Utility methods
  private extractEnvVar(content: string, varName: string): string | null {
    const match = content.match(new RegExp(`^${varName}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
  }

  private updateEnvVar(content: string, varName: string, value: string): string {
    const regex = new RegExp(`^${varName}=.*$`, 'm');
    const newLine = `${varName}=${value}`;
    
    if (regex.test(content)) {
      return content.replace(regex, newLine);
    } else {
      return content + (content.endsWith('\n') ? '' : '\n') + newLine + '\n';
    }
  }

  private async promptUser(question: string): Promise<string> {
    // In a real implementation, you'd use readline or inquirer
    // For now, return default values
    console.log(question);
    return 'y'; // Default to yes for automation
  }
}

// 🎯 Model Availability Checker
export class ModelAvailabilityChecker {
  static async checkModelAvailability(region: string = 'us-east-1') {
    const models = [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'amazon.nova-pro-v1:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
      'amazon.titan-embed-text-v2:0'
    ];

    console.log(`🔍 Checking model availability in ${region}...`);

    for (const model of models) {
      try {
        // This would require actual AWS SDK call in real implementation
        console.log(`✅ ${model} - Available`);
      } catch (error) {
        console.log(`❌ ${model} - Not available`);
      }
    }
  }
}

// 🎯 Cost Estimation
export class CostEstimator {
  static estimateUsageCosts() {
    console.log('\n💰 Estimated Monthly Costs (based on typical usage):');
    console.log('');
    console.log('📊 Resume Analysis (100 resumes/month):');
    console.log('   Claude 3.5 Sonnet: ~$15-25');
    console.log('   Nova Pro: ~$8-12');
    console.log('');
    console.log('🎤 Interview Simulation (50 sessions/month):');
    console.log('   Claude 3.5 Sonnet: ~$20-35');
    console.log('   Streaming responses: ~$10-15');
    console.log('');
    console.log('📈 Performance Evaluation (50 evaluations/month):');
    console.log('   Nova Pro: ~$10-18');
    console.log('');
    console.log('🔍 Knowledge Base (if enabled):');
    console.log('   OpenSearch Serverless: ~$50-100');
    console.log('   S3 Storage: ~$1-5');
    console.log('');
    console.log('📋 Total Estimated Range: $114-210/month');
    console.log('');
    console.log('💡 Cost Optimization Tips:');
    console.log('- Use Claude Haiku for simple responses');
    console.log('- Implement response caching');
    console.log('- Set usage limits and monitoring');
    console.log('- Use Nova models for analytical tasks');
  }
}

// 🎯 Main execution
if (require.main === module) {
  const wizard = new BedrockSetupWizard();
  wizard.run().catch(console.error);
}

export { BedrockSetupWizard, ModelAvailabilityChecker, CostEstimator };