// app/api/test-nova/route.ts
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing Nova Sonic...');
    
    // 1. Check credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ 
        error: 'Missing AWS credentials',
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY 
      });
    }

    // 2. Test Bedrock client
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // 3. Test simple text-only request first
    const payload = {
      schemaVersion: "1.0",
      inferenceConfig: {
        maxTokens: 100,
        temperature: 0.7,
      },
      system: [{ text: "You are a helpful assistant." }],
      messages: [{
        role: "user",
        content: [{ text: "Say hello" }]
      }],
      outputModalities: ["text"]
    };

    const command = new InvokeModelCommand({
      modelId: process.env.NOVA_SONIC_MODEL_ID || 'amazon.nova-sonic-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return NextResponse.json({
      success: true,
      modelId: process.env.NOVA_SONIC_MODEL_ID,
      region: process.env.AWS_REGION,
      response: responseBody
    });

  } catch (error: any) {
    console.error('❌ Nova test failed:', error);
    
    return NextResponse.json({
      error: error.message,
      errorName: error.name,
      errorCode: error.$metadata?.httpStatusCode,
      modelId: process.env.NOVA_SONIC_MODEL_ID,
      region: process.env.AWS_REGION
    }, { status: 500 });
  }
}