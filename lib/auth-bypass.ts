// Temporary auth bypass for testing Bedrock functionality
// Use this when you want to test the AI features without setting up Cognito

export class AuthBypass {
  static async signUp(email: string, password: string, name: string) {
    console.log('🔓 Auth bypass: Sign up simulated');
    return {
      UserSub: 'test-user-123',
      CodeDeliveryDetails: {
        Destination: email,
        DeliveryMedium: 'EMAIL'
      }
    };
  }

  static async confirmSignUp(email: string, code: string) {
    console.log('🔓 Auth bypass: Confirmation simulated');
    return { success: true };
  }

  static async signIn(email: string, password: string) {
    console.log('🔓 Auth bypass: Sign in simulated');
    return {
      accessToken: 'test-access-token',
      idToken: 'test-id-token',
      refreshToken: 'test-refresh-token'
    };
  }

  static async resendCode(email: string) {
    console.log('🔓 Auth bypass: Resend code simulated');
    return { success: true };
  }
}

// Check if Cognito is configured
export const isCognitoConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID &&
    process.env.AWS_COGNITO_USER_POOL_ID
  );
};

// Export the appropriate auth service
export const getAuthService = () => {
  if (isCognitoConfigured()) {
    return require('./auth-service').AuthService;
  } else {
    console.warn('⚠️ Cognito not configured, using auth bypass for testing');
    return AuthBypass;
  }
};