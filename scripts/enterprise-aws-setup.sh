#!/bin/bash

# Enterprise Interview Prep AI - AWS Setup Script
# This script sets up AWS resources for production deployment

set -e

echo "🚀 Setting up Enterprise Interview Prep AI on AWS..."

# Variables
REGION=${AWS_REGION:-us-east-1}
APP_NAME="interview-prep-ai"
ENVIRONMENT=${ENVIRONMENT:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check AWS CLI installation
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

print_status "AWS CLI configured and credentials verified"

# 1. Enable Bedrock Model Access
echo "📋 Requesting Bedrock model access..."

# Request access to Amazon Nova models
aws bedrock put-model-invocation-logging-configuration \
    --region $REGION \
    --logging-config '{
        "cloudWatchConfig": {
            "logGroupName": "/aws/bedrock/modelinvocations",
            "roleArn": "arn:aws:iam::'$(aws sts get-caller-identity --query Account --output text)':role/service-role/AmazonBedrockExecutionRoleForCloudWatchLogs"
        },
        "embeddingDataDeliveryEnabled": false,
        "imageDataDeliveryEnabled": false,
        "textDataDeliveryEnabled": true
    }' 2>/dev/null || print_warning "Bedrock logging already configured"

# Check model access
echo "🔍 Checking model access..."
MODELS=(
    "amazon.nova-lite-v1:0"
    "amazon.nova-pro-v1:0" 
    "amazon.nova-2-sonic-v1:0"
    "amazon.nova-micro-v1:0"
    "amazon.titan-embed-text-v2:0"
)

for model in "${MODELS[@]}"; do
    if aws bedrock get-foundation-model --model-identifier "$model" --region $REGION &> /dev/null; then
        print_status "Model access confirmed: $model"
    else
        print_warning "Model access needed: $model - Request access in AWS Console"
    fi
done

# 2. Create CloudWatch Log Groups
echo "📊 Setting up CloudWatch monitoring..."

aws logs create-log-group \
    --log-group-name "/aws/lambda/$APP_NAME-enterprise" \
    --region $REGION 2>/dev/null || print_warning "Log group already exists"

aws logs create-log-group \
    --log-group-name "/aws/bedrock/modelinvocations" \
    --region $REGION 2>/dev/null || print_warning "Bedrock log group already exists"

print_status "CloudWatch log groups created"

# 3. Create IAM Role for Enhanced Permissions
echo "🔐 Setting up IAM permissions..."

# Create trust policy
cat > trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": ["lambda.amazonaws.com", "bedrock.amazonaws.com"]
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Create permissions policy
cat > permissions-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream",
                "bedrock:GetFoundationModel",
                "bedrock:ListFoundationModels"
            ],
            "Resource": [
                "arn:aws:bedrock:$REGION::foundation-model/amazon.nova-*",
                "arn:aws:bedrock:$REGION::foundation-model/amazon.titan-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": "arn:aws:logs:$REGION:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricData",
                "cloudwatch:GetMetricStatistics",
                "cloudwatch:ListMetrics"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:AdminInitiateAuth",
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword"
            ],
            "Resource": "arn:aws:cognito-idp:$REGION:*:userpool/*"
        }
    ]
}
EOF

# Create IAM role
aws iam create-role \
    --role-name "$APP_NAME-enterprise-role" \
    --assume-role-policy-document file://trust-policy.json \
    --region $REGION 2>/dev/null || print_warning "IAM role already exists"

aws iam put-role-policy \
    --role-name "$APP_NAME-enterprise-role" \
    --policy-name "$APP_NAME-enterprise-policy" \
    --policy-document file://permissions-policy.json \
    --region $REGION

print_status "IAM role and policies configured"

# 4. Create CloudWatch Alarms for Model Monitoring
echo "⚠️ Setting up CloudWatch alarms..."

# High error rate alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "$APP_NAME-high-error-rate" \
    --alarm-description "High error rate in model invocations" \
    --metric-name "Errors" \
    --namespace "AWS/Bedrock" \
    --statistic "Sum" \
    --period 300 \
    --threshold 10 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 2 \
    --region $REGION

# High latency alarm  
aws cloudwatch put-metric-alarm \
    --alarm-name "$APP_NAME-high-latency" \
    --alarm-description "High latency in model responses" \
    --metric-name "Duration" \
    --namespace "AWS/Bedrock" \
    --statistic "Average" \
    --period 300 \
    --threshold 10000 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 2 \
    --region $REGION

print_status "CloudWatch alarms configured"

# 5. Create S3 Bucket for Model Artifacts and Logs
echo "🪣 Setting up S3 storage..."

BUCKET_NAME="$APP_NAME-enterprise-$(date +%s)"

aws s3 mb "s3://$BUCKET_NAME" --region $REGION

# Enable versioning and encryption
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'

print_status "S3 bucket created: $BUCKET_NAME"

# 6. Test Model Connectivity
echo "🧪 Testing model connectivity..."

cat > test-model.js << 'EOF'
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

async function testModel(modelId) {
    try {
        const command = new InvokeModelCommand({
            modelId,
            body: JSON.stringify({
                messages: [{ role: "user", content: [{ text: "Test: Respond with 'Model working'" }] }],
                inferenceConfig: { maxTokens: 50, temperature: 0.1 }
            }),
            contentType: "application/json"
        });
        
        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        console.log(`✓ ${modelId}: ${result.output?.message?.content?.[0]?.text || 'OK'}`);
        return true;
    } catch (error) {
        console.log(`✗ ${modelId}: ${error.message}`);
        return false;
    }
}

async function testAllModels() {
    const models = [
        "amazon.nova-lite-v1:0",
        "amazon.nova-pro-v1:0", 
        "amazon.nova-2-sonic-v1:0",
        "amazon.nova-micro-v1:0"
    ];
    
    console.log("Testing model connectivity...");
    for (const model of models) {
        await testModel(model);
    }
}

testAllModels().catch(console.error);
EOF

node test-model.js 2>/dev/null || print_warning "Model connectivity test failed - check permissions"

# 7. Create deployment configuration
echo "⚙️ Creating deployment configuration..."

cat > aws-deploy-config.json << EOF
{
    "region": "$REGION",
    "environment": "$ENVIRONMENT",
    "appName": "$APP_NAME",
    "iamRole": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$APP_NAME-enterprise-role",
    "s3Bucket": "$BUCKET_NAME",
    "models": {
        "interview": "amazon.nova-lite-v1:0",
        "resume": "amazon.nova-pro-v1:0", 
        "feedback": "amazon.nova-2-sonic-v1:0",
        "fast": "amazon.nova-micro-v1:0",
        "embedding": "amazon.titan-embed-text-v2:0"
    },
    "monitoring": {
        "logGroup": "/aws/lambda/$APP_NAME-enterprise",
        "alarms": [
            "$APP_NAME-high-error-rate",
            "$APP_NAME-high-latency"
        ]
    }
}
EOF

print_status "Deployment configuration created: aws-deploy-config.json"

# 8. Create environment variables template
echo "📝 Creating environment template..."

cat > .env.production.template << EOF
# AWS Configuration
AWS_REGION=$REGION
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Model Configuration  
INTERVIEW_DEFAULT_MODEL=amazon.nova-lite-v1:0
RESUME_ANALYSIS_MODEL=amazon.nova-pro-v1:0
FEEDBACK_MODEL=amazon.nova-2-sonic-v1:0
FAST_MODEL=amazon.nova-micro-v1:0
EMBEDDING_MODEL=amazon.titan-embed-text-v2:0

# Enterprise Features
ENABLE_MONITORING=true
ENABLE_CACHING=true
CACHE_TTL=300000
MAX_RETRIES=3

# Storage
S3_BUCKET=$BUCKET_NAME
LOG_GROUP=/aws/lambda/$APP_NAME-enterprise

# Security
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000
EOF

print_status "Environment template created: .env.production.template"

# Cleanup temporary files
rm -f trust-policy.json permissions-policy.json test-model.js

echo ""
print_status "🎉 Enterprise AWS setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.production.template to .env.production and update with your values"
echo "2. Request access to any models showing warnings in AWS Bedrock Console"
echo "3. Deploy your application using: npm run build && npm run deploy"
echo "4. Monitor performance at: https://console.aws.amazon.com/cloudwatch"
echo ""
echo "Configuration files created:"
echo "- aws-deploy-config.json (deployment settings)"
echo "- .env.production.template (environment variables)"
echo ""
print_status "Setup complete! Your enterprise interview prep AI is ready for deployment."