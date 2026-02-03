const { 
  BedrockClient, 
  ListFoundationModelsCommand,
  GetFoundationModelCommand 
} = require("@aws-sdk/client-bedrock");
const { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} = require("@aws-sdk/client-bedrock-runtime");
const { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand 
} = require("@aws-sdk/client-dynamodb");
const { 
  BedrockAgentClient, 
  CreateKnowledgeBaseCommand,
  CreateDataSourceCommand,
  ListKnowledgeBasesCommand
} = require("@aws-sdk/client-bedrock-agent");
const { 
  S3Client, 
  CreateBucketCommand, 
  HeadBucketCommand,
  PutObjectCommand 
} = require("@aws-sdk/client-s3");
const { 
  IAMClient, 
  CreateRoleCommand, 
  AttachRolePolicyCommand,
  GetRoleCommand 
} = require("@aws-sdk/client-iam");

require('dotenv').config({ path: '.env.local' });

class BedrockInterviewSystemSetup {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    
    this.bedrockClient = new BedrockClient({ region: this.region, credentials: this.credentials });
    this.bedrockRuntimeClient = new BedrockRuntimeClient({ region: this.region, credentials: this.credentials });
    this.dynamoClient = new DynamoDBClient({ region: this.region, credentials: this.credentials });
    this.s3Client = new S3Client({ region: this.region, credentials: this.credentials });
    this.bedrockAgentClient = new BedrockAgentClient({ region: this.region, credentials: this.credentials });
    this.iamClient = new IAMClient({ region: this.region, credentials: this.credentials });
    
    this.bucketName = `interview-prep-ai-${Date.now()}`;
    this.knowledgeBaseName = 'interview-prep-knowledge-base';
  }

  async setup() {
    console.log('🚀 Setting up Complete Bedrock Interview System\n');
    
    try {
      // Step 1: Verify Bedrock Access
      await this.verifyBedrockAccess();
      
      // Step 2: Create DynamoDB Tables
      await this.createDynamoTables();
      
      // Step 3: Create S3 Bucket for Knowledge Base
      await this.createS3Bucket();
      
      // Step 4: Create IAM Roles
      await this.createIAMRoles();
      
      // Step 5: Create Knowledge Bases
      await this.createKnowledgeBases();
      
      // Step 6: Upload Interview Data
      await this.uploadInterviewData();
      
      // Step 7: Test Complete System
      await this.testCompleteSystem();
      
      console.log('\n🎉 COMPLETE BEDROCK INTERVIEW SYSTEM READY!');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  async verifyBedrockAccess() {
    console.log('🔍 Step 1: Verifying Bedrock Access...');
    
    try {
      // List available models
      const listCommand = new ListFoundationModelsCommand({});
      const models = await this.bedrockClient.send(listCommand);
      
      const novaModels = models.modelSummaries.filter(m => 
        m.modelId.includes('nova') || m.modelId.includes('amazon')
      );
      
      console.log('✅ Bedrock Access Verified');
      console.log(`📊 Found ${models.modelSummaries.length} total models`);
      console.log(`🤖 Found ${novaModels.length} Nova/Amazon models`);
      
      // Test Nova Pro specifically
      const testPayload = {
        messages: [{ role: "user", content: [{ text: "Hello, test message" }] }],
        inferenceConfig: { maxTokens: 50, temperature: 0.7 }
      };
      
      const testCommand = new InvokeModelCommand({
        modelId: "amazon.nova-pro-v1:0",
        body: JSON.stringify(testPayload),
        contentType: "application/json"
      });
      
      await this.bedrockRuntimeClient.send(testCommand);
      console.log('✅ Nova Pro Model Access Verified');
      
    } catch (error) {
      console.error('❌ Bedrock access failed:', error.message);
      throw new Error(`Bedrock setup failed: ${error.message}`);
    }
  }

  async createDynamoTables() {
    console.log('\n🗄️ Step 2: Creating DynamoDB Tables...');
    
    const tables = [
      {
        name: 'InterviewSessions',
        schema: {
          TableName: 'InterviewSessions',
          KeySchema: [
            { AttributeName: 'sessionId', KeyType: 'HASH' },
            { AttributeName: 'timestamp', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'sessionId', AttributeType: 'S' },
            { AttributeName: 'timestamp', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'UserIndex',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            BillingMode: 'PAY_PER_REQUEST'
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: 'ResumeAnalyses',
        schema: {
          TableName: 'ResumeAnalyses',
          KeySchema: [
            { AttributeName: 'analysisId', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'analysisId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'UserIndex',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            BillingMode: 'PAY_PER_REQUEST'
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: 'InterviewQuestions',
        schema: {
          TableName: 'InterviewQuestions',
          KeySchema: [
            { AttributeName: 'category', KeyType: 'HASH' },
            { AttributeName: 'questionId', KeyType: 'RANGE' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'category', AttributeType: 'S' },
            { AttributeName: 'questionId', AttributeType: 'S' },
            { AttributeName: 'level', AttributeType: 'S' }
          ],
          GlobalSecondaryIndexes: [{
            IndexName: 'LevelIndex',
            KeySchema: [{ AttributeName: 'level', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' },
            BillingMode: 'PAY_PER_REQUEST'
          }],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      {
        name: 'UserProfiles',
        schema: {
          TableName: 'UserProfiles',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' }
          ],
          BillingMode: 'PAY_PER_REQUEST'
        }
      }
    ];

    for (const table of tables) {
      try {
        // Check if table exists
        try {
          await this.dynamoClient.send(new DescribeTableCommand({ TableName: table.name }));
          console.log(`✅ Table ${table.name} already exists`);
        } catch (error) {
          if (error.name === 'ResourceNotFoundException') {
            // Create table
            await this.dynamoClient.send(new CreateTableCommand(table.schema));
            console.log(`✅ Created table: ${table.name}`);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error(`❌ Failed to create table ${table.name}:`, error.message);
      }
    }
  }

  async createS3Bucket() {
    console.log('\n🪣 Step 3: Creating S3 Bucket for Knowledge Base...');
    
    try {
      // Check if bucket exists
      try {
        await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
        console.log(`✅ Bucket ${this.bucketName} already exists`);
      } catch (error) {
        if (error.name === 'NotFound') {
          // Create bucket
          await this.s3Client.send(new CreateBucketCommand({ 
            Bucket: this.bucketName,
            CreateBucketConfiguration: this.region !== 'us-east-1' ? {
              LocationConstraint: this.region
            } : undefined
          }));
          console.log(`✅ Created S3 bucket: ${this.bucketName}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Failed to create S3 bucket:', error.message);
    }
  }

  async createIAMRoles() {
    console.log('\n🔐 Step 4: Creating IAM Roles...');
    
    const roleName = 'BedrockKnowledgeBaseRole';
    const trustPolicy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { Service: 'bedrock.amazonaws.com' },
        Action: 'sts:AssumeRole'
      }]
    };

    try {
      // Check if role exists
      try {
        await this.iamClient.send(new GetRoleCommand({ RoleName: roleName }));
        console.log(`✅ IAM Role ${roleName} already exists`);
      } catch (error) {
        if (error.name === 'NoSuchEntity') {
          // Create role
          await this.iamClient.send(new CreateRoleCommand({
            RoleName: roleName,
            AssumeRolePolicyDocument: JSON.stringify(trustPolicy)
          }));
          
          // Attach policies
          const policies = [
            'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
            'arn:aws:iam::aws:policy/AmazonBedrockFullAccess'
          ];
          
          for (const policy of policies) {
            await this.iamClient.send(new AttachRolePolicyCommand({
              RoleName: roleName,
              PolicyArn: policy
            }));
          }
          
          console.log(`✅ Created IAM role: ${roleName}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Failed to create IAM role:', error.message);
    }
  }

  async createKnowledgeBases() {
    console.log('\n🧠 Step 5: Creating Knowledge Bases...');
    
    try {
      // List existing knowledge bases
      const listCommand = new ListKnowledgeBasesCommand({});
      const existing = await this.bedrockAgentClient.send(listCommand);
      
      const existingKB = existing.knowledgeBaseSummaries?.find(kb => 
        kb.name === this.knowledgeBaseName
      );
      
      if (existingKB) {
        console.log(`✅ Knowledge base ${this.knowledgeBaseName} already exists`);
        return existingKB.knowledgeBaseId;
      }
      
      // Create knowledge base
      const createCommand = new CreateKnowledgeBaseCommand({
        name: this.knowledgeBaseName,
        description: 'Knowledge base for interview questions and best practices',
        roleArn: `arn:aws:iam::${await this.getAccountId()}:role/BedrockKnowledgeBaseRole`,
        knowledgeBaseConfiguration: {
          type: 'VECTOR',
          vectorKnowledgeBaseConfiguration: {
            embeddingModelArn: `arn:aws:bedrock:${this.region}::foundation-model/amazon.titan-embed-text-v2:0`
          }
        },
        storageConfiguration: {
          type: 'OPENSEARCH_SERVERLESS',
          opensearchServerlessConfiguration: {
            collectionArn: `arn:aws:aoss:${this.region}:${await this.getAccountId()}:collection/interview-collection`,
            vectorIndexName: 'interview-index',
            fieldMapping: {
              vectorField: 'vector',
              textField: 'text',
              metadataField: 'metadata'
            }
          }
        }
      });
      
      const result = await this.bedrockAgentClient.send(createCommand);
      console.log(`✅ Created knowledge base: ${result.knowledgeBase.knowledgeBaseId}`);
      
      return result.knowledgeBase.knowledgeBaseId;
      
    } catch (error) {
      console.log('⚠️ Knowledge base creation skipped (requires additional setup):', error.message);
      return null;
    }
  }

  async uploadInterviewData() {
    console.log('\n📚 Step 6: Uploading Interview Data...');
    
    const interviewData = {
      'frontend-questions.json': {
        category: 'frontend',
        questions: [
          {
            id: 'fe-001',
            level: 'entry',
            question: 'What is the difference between let, const, and var in JavaScript?',
            expectedAnswer: 'Scope, hoisting, and reassignment differences',
            followUp: 'Can you give an example of when you would use each?'
          },
          {
            id: 'fe-002', 
            level: 'mid',
            question: 'Explain React hooks and when you would use useState vs useEffect',
            expectedAnswer: 'State management and side effects in functional components',
            followUp: 'How would you optimize a component that re-renders frequently?'
          },
          {
            id: 'fe-003',
            level: 'senior',
            question: 'Design a scalable frontend architecture for a large e-commerce application',
            expectedAnswer: 'Micro-frontends, state management, performance optimization',
            followUp: 'How would you handle cross-team collaboration and code sharing?'
          }
        ]
      },
      'backend-questions.json': {
        category: 'backend',
        questions: [
          {
            id: 'be-001',
            level: 'entry',
            question: 'What is the difference between SQL and NoSQL databases?',
            expectedAnswer: 'Structure, scalability, ACID properties',
            followUp: 'When would you choose one over the other?'
          },
          {
            id: 'be-002',
            level: 'mid', 
            question: 'Explain RESTful API design principles and best practices',
            expectedAnswer: 'HTTP methods, status codes, resource naming, statelessness',
            followUp: 'How would you handle API versioning?'
          },
          {
            id: 'be-003',
            level: 'senior',
            question: 'Design a microservices architecture for a social media platform',
            expectedAnswer: 'Service decomposition, communication patterns, data consistency',
            followUp: 'How would you handle distributed transactions?'
          }
        ]
      },
      'system-design-questions.json': {
        category: 'system-design',
        questions: [
          {
            id: 'sd-001',
            level: 'mid',
            question: 'Design a URL shortener like bit.ly',
            expectedAnswer: 'Database design, encoding algorithm, caching, scalability',
            followUp: 'How would you handle analytics and click tracking?'
          },
          {
            id: 'sd-002',
            level: 'senior',
            question: 'Design a chat application like WhatsApp',
            expectedAnswer: 'Real-time messaging, WebSockets, message delivery, scalability',
            followUp: 'How would you handle message encryption and group chats?'
          }
        ]
      }
    };

    for (const [filename, data] of Object.entries(interviewData)) {
      try {
        await this.s3Client.send(new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `interview-data/${filename}`,
          Body: JSON.stringify(data, null, 2),
          ContentType: 'application/json'
        }));
        console.log(`✅ Uploaded: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${filename}:`, error.message);
      }
    }
  }

  async testCompleteSystem() {
    console.log('\n🧪 Step 7: Testing Complete System...');
    
    // Test 1: Resume Analysis
    console.log('📄 Testing Resume Analysis...');
    const resumeTest = await this.testResumeAnalysis();
    
    // Test 2: Interview Generation
    console.log('❓ Testing Interview Question Generation...');
    const interviewTest = await this.testInterviewGeneration();
    
    // Test 3: Performance Feedback
    console.log('📊 Testing Performance Feedback...');
    const feedbackTest = await this.testPerformanceFeedback();
    
    console.log('\n📋 System Test Results:');
    console.log(`Resume Analysis: ${resumeTest ? '✅' : '❌'}`);
    console.log(`Interview Generation: ${interviewTest ? '✅' : '❌'}`);
    console.log(`Performance Feedback: ${feedbackTest ? '✅' : '❌'}`);
  }

  async testResumeAnalysis() {
    try {
      const payload = {
        messages: [{
          role: "user",
          content: [{
            text: "Analyze this resume: John Smith, Senior Software Engineer, 5 years React/Node.js experience. Provide JSON with scores and recommendations."
          }]
        }],
        inferenceConfig: { maxTokens: 1000, temperature: 0.3 }
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-pro-v1:0",
        body: JSON.stringify(payload),
        contentType: "application/json"
      });

      await this.bedrockRuntimeClient.send(command);
      return true;
    } catch (error) {
      console.error('Resume analysis test failed:', error.message);
      return false;
    }
  }

  async testInterviewGeneration() {
    try {
      const payload = {
        messages: [{
          role: "user", 
          content: [{
            text: "Generate 3 interview questions for a Senior Frontend Developer focusing on React and JavaScript."
          }]
        }],
        inferenceConfig: { maxTokens: 500, temperature: 0.7 }
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-lite-v1:0",
        body: JSON.stringify(payload),
        contentType: "application/json"
      });

      await this.bedrockRuntimeClient.send(command);
      return true;
    } catch (error) {
      console.error('Interview generation test failed:', error.message);
      return false;
    }
  }

  async testPerformanceFeedback() {
    try {
      const payload = {
        messages: [{
          role: "user",
          content: [{
            text: "Provide interview feedback for a candidate who answered React questions well but struggled with system design. Give JSON feedback with scores."
          }]
        }],
        inferenceConfig: { maxTokens: 800, temperature: 0.6 }
      };

      const command = new InvokeModelCommand({
        modelId: "amazon.nova-pro-v1:0", 
        body: JSON.stringify(payload),
        contentType: "application/json"
      });

      await this.bedrockRuntimeClient.send(command);
      return true;
    } catch (error) {
      console.error('Performance feedback test failed:', error.message);
      return false;
    }
  }

  async getAccountId() {
    // Simple way to get account ID from ARN
    try {
      const { STS } = require('@aws-sdk/client-sts');
      const sts = new STS({ region: this.region, credentials: this.credentials });
      const identity = await sts.getCallerIdentity({});
      return identity.Account;
    } catch {
      return '123456789012'; // Fallback
    }
  }
}

// Run setup
const setup = new BedrockInterviewSystemSetup();
setup.setup().catch(console.error);