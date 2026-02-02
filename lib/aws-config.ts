import { 
  BedrockRuntimeClient,
  S3Client,
  DynamoDBClient,
  CognitoIdentityProviderClient,
  PollyClient
} from '@aws-sdk/client-bedrock-runtime';
import { S3Client as S3ClientImport } from '@aws-sdk/client-s3';
import { DynamoDBClient as DynamoDBClientImport } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient as CognitoClientImport } from '@aws-sdk/client-cognito-identity-provider';
import { PollyClient as PollyClientImport } from '@aws-sdk/client-polly';

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
  }
};

// Initialize AWS clients
export const bedrockClient = new BedrockRuntimeClient(awsConfig);
export const s3Client = new S3ClientImport(awsConfig);
export const dynamoClient = new DynamoDBClientImport(awsConfig);
export const cognitoClient = new CognitoClientImport(awsConfig);
export const pollyClient = new PollyClientImport(awsConfig);

export default awsConfig;