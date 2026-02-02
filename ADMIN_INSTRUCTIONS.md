# 🔐 AWS Admin Instructions

## Problem
IAM user `BedrockAPIKey-xwhp` needs Bedrock permissions.

## Solution 1: Use AWS Managed Policy (Recommended)
```bash
aws iam attach-user-policy \
  --user-name BedrockAPIKey-xwhp \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

## Solution 2: Create Minimal Custom Policy
```bash
# 1. Create policy
aws iam create-policy \
  --policy-name BedrockInvokeOnly \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ],
        "Resource": "*"
      }
    ]
  }'

# 2. Attach to user
aws iam attach-user-policy \
  --user-name BedrockAPIKey-xwhp \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/BedrockInvokeOnly
```

## Test After Permission Added
```bash
node test-env-creds.js
```

## Expected Result
✅ Your interview AI will work with:
- Resume analysis
- Interview questions
- Performance feedback
- Voice integration (future)

**Cost: ~$15-50/month for typical usage**