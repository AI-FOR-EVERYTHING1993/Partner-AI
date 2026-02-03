import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
  return crypto.createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    // Check if auth bypass is enabled
    const isAuthBypassEnabled = process.env.AUTH_BYPASS_ENABLED === 'true' || 
      !process.env.AWS_COGNITO_CLIENT_ID ||
      process.env.AWS_COGNITO_CLIENT_ID === 'your_client_id_here';

    if (isAuthBypassEnabled) {
      console.log('🔓 Auth bypass: Resend code simulated for', username);
      return NextResponse.json({ 
        success: true, 
        message: 'Verification code sent! (Auth bypass mode)'
      });
    }
    
    const cognitoClient = new CognitoIdentityProviderClient({
      region: 'us-east-1'
    });

    const secretHash = generateSecretHash(
      username, 
      process.env.AWS_COGNITO_CLIENT_ID!, 
      process.env.AWS_COGNITO_CLIENT_SECRET!
    );

    const command = new ResendConfirmationCodeCommand({
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      Username: username,
      SecretHash: secretHash
    });

    await cognitoClient.send(command);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email'
    });
  } catch (error: any) {
    console.error('Resend error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 400 });
  }
}