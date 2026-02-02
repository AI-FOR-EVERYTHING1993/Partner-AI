import { NextRequest } from "next/server";

export async function GET() {
  try {
    // Test basic API functionality
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        api: "operational",
        database: "checking...",
        bedrock: "checking...",
        nova: "checking..."
      }
    };

    // Test environment variables
    const envCheck = {
      aws_region: process.env.AWS_REGION ? "configured" : "missing",
      cognito_pool: process.env.AWS_COGNITO_USER_POOL_ID ? "configured" : "missing",
      cognito_client: process.env.AWS_COGNITO_CLIENT_ID ? "configured" : "missing",
      bedrock_token: process.env.AWS_BEARER_TOKEN_BEDROCK ? "configured" : "missing",
      nova_model: process.env.NOVA_SONIC_MODEL_ID ? "configured" : "missing"
    };

    return Response.json({
      ...healthCheck,
      environment: envCheck,
      message: "API is operational"
    });
  } catch (error) {
    return Response.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}