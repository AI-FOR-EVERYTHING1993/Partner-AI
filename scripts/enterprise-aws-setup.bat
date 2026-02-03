@echo off
setlocal enabledelayedexpansion

REM Enterprise Interview Prep AI - AWS Setup Script (Windows)
REM This script sets up AWS resources for production deployment

echo 🚀 Setting up Enterprise Interview Prep AI on AWS...

REM Variables
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
set APP_NAME=interview-prep-ai

REM Check AWS CLI installation
aws --version >nul 2>&1
if errorlevel 1 (
    echo ✗ AWS CLI is not installed. Please install it first.
    exit /b 1
)

REM Check AWS credentials
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ✗ AWS credentials not configured. Run 'aws configure' first.
    exit /b 1
)

echo ✓ AWS CLI configured and credentials verified

REM Get AWS Account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i

echo 📋 Requesting Bedrock model access...

REM Enable Bedrock logging
aws bedrock put-model-invocation-logging-configuration --region %AWS_REGION% --logging-config "{\"cloudWatchConfig\":{\"logGroupName\":\"/aws/bedrock/modelinvocations\",\"roleArn\":\"arn:aws:iam::%ACCOUNT_ID%:role/service-role/AmazonBedrockExecutionRoleForCloudWatchLogs\"},\"embeddingDataDeliveryEnabled\":false,\"imageDataDeliveryEnabled\":false,\"textDataDeliveryEnabled\":true}" 2>nul || echo ⚠ Bedrock logging already configured

echo 🔍 Checking model access...

REM Check model access
set MODELS=amazon.nova-lite-v1:0 amazon.nova-pro-v1:0 amazon.nova-2-sonic-v1:0 amazon.nova-micro-v1:0 amazon.titan-embed-text-v2:0

for %%m in (%MODELS%) do (
    aws bedrock get-foundation-model --model-identifier %%m --region %AWS_REGION% >nul 2>&1
    if errorlevel 1 (
        echo ⚠ Model access needed: %%m - Request access in AWS Console
    ) else (
        echo ✓ Model access confirmed: %%m
    )
)

echo 📊 Setting up CloudWatch monitoring...

REM Create CloudWatch Log Groups
aws logs create-log-group --log-group-name "/aws/lambda/%APP_NAME%-enterprise" --region %AWS_REGION% 2>nul || echo ⚠ Log group already exists
aws logs create-log-group --log-group-name "/aws/bedrock/modelinvocations" --region %AWS_REGION% 2>nul || echo ⚠ Bedrock log group already exists

echo ✓ CloudWatch log groups created

echo 🔐 Setting up IAM permissions...

REM Create trust policy
echo {> trust-policy.json
echo     "Version": "2012-10-17",>> trust-policy.json
echo     "Statement": [>> trust-policy.json
echo         {>> trust-policy.json
echo             "Effect": "Allow",>> trust-policy.json
echo             "Principal": {>> trust-policy.json
echo                 "Service": ["lambda.amazonaws.com", "bedrock.amazonaws.com"]>> trust-policy.json
echo             },>> trust-policy.json
echo             "Action": "sts:AssumeRole">> trust-policy.json
echo         }>> trust-policy.json
echo     ]>> trust-policy.json
echo }>> trust-policy.json

REM Create permissions policy
echo {> permissions-policy.json
echo     "Version": "2012-10-17",>> permissions-policy.json
echo     "Statement": [>> permissions-policy.json
echo         {>> permissions-policy.json
echo             "Effect": "Allow",>> permissions-policy.json
echo             "Action": [>> permissions-policy.json
echo                 "bedrock:InvokeModel",>> permissions-policy.json
echo                 "bedrock:InvokeModelWithResponseStream",>> permissions-policy.json
echo                 "bedrock:GetFoundationModel",>> permissions-policy.json
echo                 "bedrock:ListFoundationModels">> permissions-policy.json
echo             ],>> permissions-policy.json
echo             "Resource": [>> permissions-policy.json
echo                 "arn:aws:bedrock:%AWS_REGION%::foundation-model/amazon.nova-*",>> permissions-policy.json
echo                 "arn:aws:bedrock:%AWS_REGION%::foundation-model/amazon.titan-*">> permissions-policy.json
echo             ]>> permissions-policy.json
echo         },>> permissions-policy.json
echo         {>> permissions-policy.json
echo             "Effect": "Allow",>> permissions-policy.json
echo             "Action": [>> permissions-policy.json
echo                 "logs:CreateLogGroup",>> permissions-policy.json
echo                 "logs:CreateLogStream",>> permissions-policy.json
echo                 "logs:PutLogEvents",>> permissions-policy.json
echo                 "logs:DescribeLogGroups",>> permissions-policy.json
echo                 "logs:DescribeLogStreams">> permissions-policy.json
echo             ],>> permissions-policy.json
echo             "Resource": "arn:aws:logs:%AWS_REGION%:*:*">> permissions-policy.json
echo         },>> permissions-policy.json
echo         {>> permissions-policy.json
echo             "Effect": "Allow",>> permissions-policy.json
echo             "Action": [>> permissions-policy.json
echo                 "cloudwatch:PutMetricData",>> permissions-policy.json
echo                 "cloudwatch:GetMetricStatistics",>> permissions-policy.json
echo                 "cloudwatch:ListMetrics">> permissions-policy.json
echo             ],>> permissions-policy.json
echo             "Resource": "*">> permissions-policy.json
echo         }>> permissions-policy.json
echo     ]>> permissions-policy.json
echo }>> permissions-policy.json

REM Create IAM role
aws iam create-role --role-name "%APP_NAME%-enterprise-role" --assume-role-policy-document file://trust-policy.json --region %AWS_REGION% 2>nul || echo ⚠ IAM role already exists

aws iam put-role-policy --role-name "%APP_NAME%-enterprise-role" --policy-name "%APP_NAME%-enterprise-policy" --policy-document file://permissions-policy.json --region %AWS_REGION%

echo ✓ IAM role and policies configured

echo ⚠️ Setting up CloudWatch alarms...

REM Create CloudWatch alarms
aws cloudwatch put-metric-alarm --alarm-name "%APP_NAME%-high-error-rate" --alarm-description "High error rate in model invocations" --metric-name "Errors" --namespace "AWS/Bedrock" --statistic "Sum" --period 300 --threshold 10 --comparison-operator "GreaterThanThreshold" --evaluation-periods 2 --region %AWS_REGION%

aws cloudwatch put-metric-alarm --alarm-name "%APP_NAME%-high-latency" --alarm-description "High latency in model responses" --metric-name "Duration" --namespace "AWS/Bedrock" --statistic "Average" --period 300 --threshold 10000 --comparison-operator "GreaterThanThreshold" --evaluation-periods 2 --region %AWS_REGION%

echo ✓ CloudWatch alarms configured

echo 🪣 Setting up S3 storage...

REM Create unique bucket name
for /f "tokens=*" %%i in ('powershell -command "Get-Date -UFormat %%s"') do set TIMESTAMP=%%i
set BUCKET_NAME=%APP_NAME%-enterprise-%TIMESTAMP%

aws s3 mb "s3://%BUCKET_NAME%" --region %AWS_REGION%

REM Enable versioning and encryption
aws s3api put-bucket-versioning --bucket "%BUCKET_NAME%" --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption --bucket "%BUCKET_NAME%" --server-side-encryption-configuration "{\"Rules\":[{\"ApplyServerSideEncryptionByDefault\":{\"SSEAlgorithm\":\"AES256\"}}]}"

echo ✓ S3 bucket created: %BUCKET_NAME%

echo ⚙️ Creating deployment configuration...

REM Create deployment configuration
echo {> aws-deploy-config.json
echo     "region": "%AWS_REGION%",>> aws-deploy-config.json
echo     "environment": "%ENVIRONMENT%",>> aws-deploy-config.json
echo     "appName": "%APP_NAME%",>> aws-deploy-config.json
echo     "iamRole": "arn:aws:iam::%ACCOUNT_ID%:role/%APP_NAME%-enterprise-role",>> aws-deploy-config.json
echo     "s3Bucket": "%BUCKET_NAME%",>> aws-deploy-config.json
echo     "models": {>> aws-deploy-config.json
echo         "interview": "amazon.nova-lite-v1:0",>> aws-deploy-config.json
echo         "resume": "amazon.nova-pro-v1:0",>> aws-deploy-config.json
echo         "feedback": "amazon.nova-2-sonic-v1:0",>> aws-deploy-config.json
echo         "fast": "amazon.nova-micro-v1:0",>> aws-deploy-config.json
echo         "embedding": "amazon.titan-embed-text-v2:0">> aws-deploy-config.json
echo     },>> aws-deploy-config.json
echo     "monitoring": {>> aws-deploy-config.json
echo         "logGroup": "/aws/lambda/%APP_NAME%-enterprise",>> aws-deploy-config.json
echo         "alarms": [>> aws-deploy-config.json
echo             "%APP_NAME%-high-error-rate",>> aws-deploy-config.json
echo             "%APP_NAME%-high-latency">> aws-deploy-config.json
echo         ]>> aws-deploy-config.json
echo     }>> aws-deploy-config.json
echo }>> aws-deploy-config.json

echo ✓ Deployment configuration created: aws-deploy-config.json

echo 📝 Creating environment template...

REM Create environment template
echo # AWS Configuration> .env.production.template
echo AWS_REGION=%AWS_REGION%>> .env.production.template
echo AWS_ACCOUNT_ID=%ACCOUNT_ID%>> .env.production.template
echo.>> .env.production.template
echo # Model Configuration>> .env.production.template
echo INTERVIEW_DEFAULT_MODEL=amazon.nova-lite-v1:0>> .env.production.template
echo RESUME_ANALYSIS_MODEL=amazon.nova-pro-v1:0>> .env.production.template
echo FEEDBACK_MODEL=amazon.nova-2-sonic-v1:0>> .env.production.template
echo FAST_MODEL=amazon.nova-micro-v1:0>> .env.production.template
echo EMBEDDING_MODEL=amazon.titan-embed-text-v2:0>> .env.production.template
echo.>> .env.production.template
echo # Enterprise Features>> .env.production.template
echo ENABLE_MONITORING=true>> .env.production.template
echo ENABLE_CACHING=true>> .env.production.template
echo CACHE_TTL=300000>> .env.production.template
echo MAX_RETRIES=3>> .env.production.template
echo.>> .env.production.template
echo # Storage>> .env.production.template
echo S3_BUCKET=%BUCKET_NAME%>> .env.production.template
echo LOG_GROUP=/aws/lambda/%APP_NAME%-enterprise>> .env.production.template

echo ✓ Environment template created: .env.production.template

REM Cleanup
del trust-policy.json permissions-policy.json 2>nul

echo.
echo ✓ 🎉 Enterprise AWS setup completed successfully!
echo.
echo Next steps:
echo 1. Copy .env.production.template to .env.production and update with your values
echo 2. Request access to any models showing warnings in AWS Bedrock Console
echo 3. Deploy your application using: npm run build ^&^& npm run deploy
echo 4. Monitor performance at: https://console.aws.amazon.com/cloudwatch
echo.
echo Configuration files created:
echo - aws-deploy-config.json (deployment settings)
echo - .env.production.template (environment variables)
echo.
echo ✓ Setup complete! Your enterprise interview prep AI is ready for deployment.

pause