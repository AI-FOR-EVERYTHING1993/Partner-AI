import { NextRequest, NextResponse } from 'next/server';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { fromIni } from '@aws-sdk/credential-providers';

const polly = new PollyClient({
  region: 'us-east-1',
  credentials: fromIni()
});

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId = 'Joanna' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      Engine: 'neural'
    });

    const response = await polly.send(command);
    const audioBuffer = Buffer.from(await response.AudioStream!.transformToByteArray());

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('Voice synthesis error:', error);
    return NextResponse.json({ 
      error: 'Failed to synthesize speech',
      details: error.message 
    }, { status: 500 });
  }
}