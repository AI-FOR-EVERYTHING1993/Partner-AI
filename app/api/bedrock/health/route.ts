import { NextRequest, NextResponse } from 'next/server';
import { bedrockClient } from '@/lib/aws-config';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Quick health check with minimal payload
    const testPayload = {
      messages: [{ role: "user", content: [{ text: "Health check" }] }],
      inferenceConfig: { maxTokens: 10, temperature: 0.1 }
    };

    const command = new InvokeModelCommand({
      modelId: process.env.FAST_MODEL || "amazon.nova-micro-v1:0",
      body: JSON.stringify(testPayload),
      contentType: "application/json"
    });

    const response = await bedrockClient.send(command);
    const responseTime = Date.now() - startTime;
    
    // Parse response to verify it's working
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const hasValidResponse = result.output?.message?.content?.[0]?.text;

    return NextResponse.json({
      status: hasValidResponse ? 'healthy' : 'degraded',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      models: {
        interview: process.env.INTERVIEW_DEFAULT_MODEL,
        resume: process.env.RESUME_ANALYSIS_MODEL,
        feedback: process.env.FEEDBACK_MODEL,
        fast: process.env.FAST_MODEL
      },
      region: process.env.AWS_REGION,
      production: process.env.NODE_ENV === 'production'
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      region: process.env.AWS_REGION,
      production: process.env.NODE_ENV === 'production'
    }, { status: 503 });
  }
}

// Quick model test endpoint
export async function POST(request: NextRequest) {
  try {
    const { modelId } = await request.json();
    const targetModel = modelId || process.env.FAST_MODEL;
    
    const startTime = Date.now();
    const testPayload = {
      messages: [{ role: "user", content: [{ text: "Test: respond with OK" }] }],
      inferenceConfig: { maxTokens: 5, temperature: 0.1 }
    };

    const command = new InvokeModelCommand({
      modelId: targetModel,
      body: JSON.stringify(testPayload),
      contentType: "application/json"
    });

    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      modelId: targetModel,
      responseTime: `${responseTime}ms`,
      response: result.output?.message?.content?.[0]?.text || 'No response',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}