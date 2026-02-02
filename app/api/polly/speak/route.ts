import { NextRequest } from 'next/server';
import { pollyService } from '@/lib/polly-service';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'Joanna', format = 'mp3' } = await request.json();
    
    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 3000) {
      return Response.json({ error: 'Text too long (max 3000 characters)' }, { status: 400 });
    }

    const audioBuffer = await pollyService.synthesizeSpeech(text, voice, format);
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': `audio/${format}`,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Polly API error:', error);
    return Response.json({ 
      error: 'Speech synthesis failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const voices = await pollyService.getVoices();
    return Response.json({ voices });
  } catch (error) {
    console.error('Get voices error:', error);
    return Response.json({ error: 'Failed to get voices' }, { status: 500 });
  }
}