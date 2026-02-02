import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_BEARER_TOKEN_BEDROCK
  }
});

export class PollyService {
  async synthesizeSpeech(text: string, voiceId = 'Joanna', outputFormat = 'mp3') {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      VoiceId: voiceId,
      OutputFormat: outputFormat,
      Engine: 'neural',
      LanguageCode: 'en-US'
    });

    try {
      const response = await pollyClient.send(command);
      
      if (response.AudioStream) {
        const chunks: Uint8Array[] = [];
        const reader = response.AudioStream.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        const audioBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          audioBuffer.set(chunk, offset);
          offset += chunk.length;
        }
        
        return audioBuffer;
      }
      
      throw new Error('No audio stream received');
    } catch (error) {
      console.error('Polly synthesis error:', error);
      throw error;
    }
  }

  async getVoices() {
    // Return available neural voices for interview scenarios
    return [
      { id: 'Joanna', name: 'Joanna', gender: 'Female', language: 'en-US' },
      { id: 'Matthew', name: 'Matthew', gender: 'Male', language: 'en-US' },
      { id: 'Amy', name: 'Amy', gender: 'Female', language: 'en-GB' },
      { id: 'Brian', name: 'Brian', gender: 'Male', language: 'en-GB' }
    ];
  }
}

export const pollyService = new PollyService();