import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export class PollyService {
  async textToSpeech(text: string): Promise<string> {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Joanna",
      Engine: "neural"
    });

    const response = await client.send(command);
    const audioStream = response.AudioStream;
    
    if (audioStream) {
      const chunks = [];
      const reader = audioStream.getReader();
      
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
      
      return `data:audio/mp3;base64,${Buffer.from(audioBuffer).toString('base64')}`;
    }
    
    throw new Error("No audio stream received");
  }
}

export const pollyService = new PollyService();