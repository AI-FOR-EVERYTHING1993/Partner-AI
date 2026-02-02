#!/bin/bash

# 🚀 AWS Bedrock Configuration Commands
# Run these commands to set up your Bedrock access properly

echo "🎯 AWS Bedrock Configuration for Interview Prep AI"
echo "=================================================="

# 1. Configure AWS CLI (if not already done)
echo ""
echo "1️⃣ Configure AWS CLI (run if not already configured):"
echo "aws configure"
echo "   - Enter your AWS Access Key ID"
echo "   - Enter your AWS Secret Access Key" 
echo "   - Enter region: us-east-1"
echo "   - Enter output format: json"

# 2. Test AWS CLI access
echo ""
echo "2️⃣ Test AWS CLI access:"
echo "aws sts get-caller-identity"

# 3. List available Bedrock models
echo ""
echo "3️⃣ List available Bedrock foundation models:"
echo "aws bedrock list-foundation-models --region us-east-1"

# 4. Check model access status
echo ""
echo "4️⃣ Check your model access permissions:"
echo "aws bedrock get-model-invocation-logging-configuration --region us-east-1"

# 5. Request model access (if needed)
echo ""
echo "5️⃣ Request access to specific models (run in AWS Console):"
echo "   Go to: AWS Console > Bedrock > Model Access"
echo "   Request access to:"
echo "   - Anthropic Claude 3.5 Sonnet"
echo "   - Amazon Nova Pro"
echo "   - Amazon Nova Sonic"
echo "   - Amazon Titan Embeddings"

# 6. Test model invocation
echo ""
echo "6️⃣ Test model invocation (Claude 3.5 Sonnet):"
cat << 'EOF'
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id "us.anthropic.claude-3-5-sonnet-20241022-v2:0" \
  --content-type "application/json" \
  --body '{"messages":[{"role":"user","content":"Hello, can you help me prepare for a software engineering interview?"}],"max_tokens":100}' \
  response.json && cat response.json
EOF

# 7. Test Nova Pro model
echo ""
echo "7️⃣ Test Nova Pro model:"
cat << 'EOF'
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id "us.amazon.nova-pro-v1:0" \
  --content-type "application/json" \
  --body '{"messages":[{"role":"user","content":"Rate this interview answer: I have 3 years of React experience."}],"max_tokens":100}' \
  nova-response.json && cat nova-response.json
EOF

# 8. Create IAM policy for Bedrock access
echo ""
echo "8️⃣ Create IAM policy for Bedrock access:"
cat << 'EOF'
aws iam create-policy \
  --policy-name BedrockInterviewPrepPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
          "bedrock:ListFoundationModels",
          "bedrock:GetFoundationModel"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "polly:SynthesizeSpeech",
          "transcribe:StartTranscriptionJob",
          "transcribe:GetTranscriptionJob"
        ],
        "Resource": "*"
      }
    ]
  }'
EOF

# 9. Attach policy to user
echo ""
echo "9️⃣ Attach policy to your IAM user (replace YOUR_USERNAME):"
echo "aws iam attach-user-policy --user-name YOUR_USERNAME --policy-arn arn:aws:iam::ACCOUNT_ID:policy/BedrockInterviewPrepPolicy"

# 10. Set up S3 bucket for resume storage
echo ""
echo "🔟 Create S3 bucket for resume storage:"
echo "aws s3 mb s3://interview-prep-resumes-$(date +%s) --region us-east-1"

# 11. Enable CloudWatch logging
echo ""
echo "1️⃣1️⃣ Enable CloudWatch logging for Bedrock:"
cat << 'EOF'
aws bedrock put-model-invocation-logging-configuration \
  --region us-east-1 \
  --logging-config '{
    "cloudWatchConfig": {
      "logGroupName": "/aws/bedrock/interview-prep",
      "roleArn": "arn:aws:iam::ACCOUNT_ID:role/BedrockLoggingRole"
    },
    "textDataDeliveryEnabled": true,
    "imageDataDeliveryEnabled": false,
    "embeddingDataDeliveryEnabled": true
  }'
EOF

echo ""
echo "🎉 Configuration Commands Ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Run the AWS CLI commands above"
echo "2. Test your access with: node scripts/test-bedrock-access.js"
echo "3. Update your .env.local with any new configuration"
echo "4. Start your development server: npm run dev"
echo ""
echo "💡 Pro Tips:"
echo "- Use us-east-1 region for best model availability"
echo "- Monitor costs in AWS Billing Dashboard"
echo "- Set up CloudWatch alarms for usage monitoring"
echo "- Consider using inference profiles for cost optimization"