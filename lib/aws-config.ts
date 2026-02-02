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
import { fromIni } from '@aws-sdk/credential-providers';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const httpHandler = new NodeHttpHandler({
  keepAlive: true,
  maxSockets: 50,
  requestTimeout: 30000,
  connectionTimeout: 5000
});

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: fromIni(),
  requestHandler: httpHandler,
  maxAttempts: 3,
  retryMode: 'adaptive'
};

// Initialize AWS clients with persistent connections
export const bedrockClient = new BedrockRuntimeClient(awsConfig);
export const s3Client = new S3ClientImport(awsConfig);
export const dynamoClient = new DynamoDBClientImport(awsConfig);
export const cognitoClient = new CognitoClientImport(awsConfig);
export const pollyClient = new PollyClientImport(awsConfig);

export default awsConfig;