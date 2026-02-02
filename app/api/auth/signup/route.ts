import { NextRequest, NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';

function generateSecretHash(username: string, clientId: string, clientSecret: string): string {
  return crypto.createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    // Create readable username from name (no email format)
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    
    const cognitoClient = new CognitoIdentityProviderClient({
      region: 'us-east-1'
    });

    const secretHash = generateSecretHash(
      username, 
      process.env.AWS_COGNITO_CLIENT_ID!, 
      process.env.AWS_COGNITO_CLIENT_SECRET!
    );

    const command = new SignUpCommand({
      ClientId: process.env.AWS_COGNITO_CLIENT_ID!,
      Username: username,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'nickname', Value: firstName },
        { Name: 'preferred_username', Value: email }
      ]
    });
    
    const response = await cognitoClient.send(command);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully! Check your email for verification code.',
      userId: response.UserSub,
      username: username
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 400 });
  }
}