import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
  return crypto.createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Check if auth bypass is enabled
    const isAuthBypassEnabled = process.env.AUTH_BYPASS_ENABLED === 'true' || 
      !process.env.AWS_COGNITO_CLIENT_ID ||
      process.env.AWS_COGNITO_CLIENT_ID === 'your_client_id_here';

    if (isAuthBypassEnabled) {
      console.log('🔓 Auth bypass: Sign in simulated for', email);
      return NextResponse.json({ 
        success: true, 
        tokens: {
          accessToken: `test-access-token-${Date.now()}`,
          idToken: `test-id-token-${Date.now()}`,
          refreshToken: `test-refresh-token-${Date.now()}`
        }
      });
    }
    
    const cognitoClient = new CognitoIdentityProviderClient({
      region: 'us-east-1'
    });

    const secretHash = generateSecretHash(
      email, 
      process.env.AWS_COGNITO_CLIENT_ID!, 
      process.env.AWS_COGNITO_CLIENT_SECRET!
    );

    const command = new InitiateAuthCommand({
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    });

    const response = await cognitoClient.send(command);
    
    return NextResponse.json({ 
      success: true, 
      tokens: {
        accessToken: response.AuthenticationResult?.AccessToken,
        idToken: response.AuthenticationResult?.IdToken,
        refreshToken: response.AuthenticationResult?.RefreshToken
      }
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 401 });
  }
}