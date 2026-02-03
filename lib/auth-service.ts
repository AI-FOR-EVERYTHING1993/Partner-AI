import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand 
} from '@aws-sdk/client-cognito-identity-provider';

// Check if auth bypass is enabled or Cognito is not configured
const isAuthBypassEnabled = process.env.AUTH_BYPASS_ENABLED === 'true' || 
  !process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID ||
  process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID === 'your_client_id_here';

if (isAuthBypassEnabled) {
  console.log('🔓 Authentication bypass enabled - Cognito authentication disabled');
}

const cognitoClient = isAuthBypassEnabled ? null : new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export class AuthService {
  static async signUp(email: string, password: string, name: string) {
    if (isAuthBypassEnabled) {
      console.log('🔓 Auth bypass: Sign up simulated for', email);
      return {
        UserSub: `test-user-${Date.now()}`,
        CodeDeliveryDetails: {
          Destination: email,
          DeliveryMedium: 'EMAIL'
        }
      };
    }

    try {
      const command = new SignUpCommand({
        ClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name }
        ]
      });
      
      return await cognitoClient!.send(command);
    } catch (error: any) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }

  static async confirmSignUp(email: string, code: string) {
    if (isAuthBypassEnabled) {
      console.log('🔓 Auth bypass: Confirmation simulated for', email);
      return { success: true };
    }

    try {
      const command = new ConfirmSignUpCommand({
        ClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
        Username: email,
        ConfirmationCode: code
      });
      
      return await cognitoClient!.send(command);
    } catch (error: any) {
      throw new Error(`Confirmation failed: ${error.message}`);
    }
  }

  static async signIn(email: string, password: string) {
    if (isAuthBypassEnabled) {
      console.log('🔓 Auth bypass: Sign in simulated for', email);
      return {
        accessToken: `test-access-token-${Date.now()}`,
        idToken: `test-id-token-${Date.now()}`,
        refreshToken: `test-refresh-token-${Date.now()}`
      };
    }

    try {
      const command = new InitiateAuthCommand({
        ClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });
      
      const response = await cognitoClient!.send(command);
      return {
        accessToken: response.AuthenticationResult?.AccessToken,
        idToken: response.AuthenticationResult?.IdToken,
        refreshToken: response.AuthenticationResult?.RefreshToken
      };
    } catch (error: any) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  static async resendCode(email: string) {
    if (isAuthBypassEnabled) {
      console.log('🔓 Auth bypass: Resend code simulated for', email);
      return { success: true };
    }

    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
        Username: email
      });
      
      return await cognitoClient!.send(command);
    } catch (error: any) {
      throw new Error(`Resend code failed: ${error.message}`);
    }
  }
}