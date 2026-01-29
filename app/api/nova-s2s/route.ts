// app/api/nova-s2s/route.ts
import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from '@aws-sdk/client-bedrock-runtime';
import { NextRequest, NextResponse } from 'next/server';
import { buildSessionConfig, createNovaPayload, parseNovaResponse, generateMockResponse } from '@/lib/nova/client';
import { InterviewContext } from '@/lib/nova/types';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { audio, context, conversationHistory } = await request.json();

    // Validate credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS credentials not configured, using mock response');
      return NextResponse.json(generateMockResponse(context));
    }

    // Build config and payload
    const config = buildSessionConfig(context as InterviewContext);
    const payload = createNovaPayload(config, audio, conversationHistory || []);

    const command = new InvokeModelCommand({
      modelId: config.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const result = parseNovaResponse(responseBody);

    return NextResponse.json({
      userTranscript: result.userTranscript,
      assistantText: result.assistantText,
      audioBase64: result.audioBase64,
      confidence: result.confidence,
    });
  } catch (error: any) {
    console.error('Nova S2S Error:', error);

    if (error.name === 'AccessDeniedException') {
      return NextResponse.json(
        { error: 'AWS access denied. Check credentials and Bedrock permissions.' },
        { status: 403 }
      );
    }

    if (error.name === 'ResourceNotFoundException') {
      return NextResponse.json(
        { error: 'Nova Sonic model not found. Enable it in AWS Bedrock console.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process audio' },
      { status: 500 }
    );
  }
}

