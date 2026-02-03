import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const bedrock = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: fromNodeProviderChain(),
});

const polly = new PollyClient({
  region: 'us-east-1', 
  credentials: fromNodeProviderChain(),
});

export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Generate AI response using Nova Lite (which works)
    const prompt = context ? 
      `You are interviewing for a ${context.role} position. The candidate said: "${text}". Ask a relevant follow-up question. Keep it under 50 words.` :
      `The user said: "${text}". Respond conversationally in under 50 words.`;

    const payload = {
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 100, temperature: 0.7 }
    };

    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-lite-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrock.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const aiText = result.output?.message?.content?.[0]?.text || 'I understand. Please continue.';

    // Convert to speech using Polly
    const speechCommand = new SynthesizeSpeechCommand({
      Text: aiText,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
      Engine: 'neural'
    });

    const speechResponse = await polly.send(speechCommand);
    const audioBuffer = await speechResponse.AudioStream?.transformToByteArray();
    const audioBase64 = audioBuffer ? Buffer.from(audioBuffer).toString('base64') : null;

    return NextResponse.json({
      userTranscript: text,
      assistantText: aiText,
      audioBase64
    });

  } catch (error: any) {
    console.error('Speech error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

