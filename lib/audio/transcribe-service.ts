import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from "@aws-sdk/client-transcribe-streaming";

export class TranscribeService {
  private client: TranscribeStreamingClient;
  private stream: any = null;

  constructor() {
    this.client = new TranscribeStreamingClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  async startTranscription(onTranscript: (text: string, isFinal: boolean) => void): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: process.env.TRANSCRIBE_LANGUAGE as any || 'en-US',
      MediaEncoding: 'pcm',
      MediaSampleRateHertz: 16000,
      AudioStream: this.createAudioStream(stream, onTranscript)
    });

    this.stream = await this.client.send(command);
    return stream;
  }

  private async* createAudioStream(mediaStream: MediaStream, onTranscript: (text: string, isFinal: boolean) => void) {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
      }
      
      return { AudioEvent: { AudioChunk: pcmData.buffer } };
    };

    // Handle transcription results
    if (this.stream?.TranscriptResultStream) {
      for await (const event of this.stream.TranscriptResultStream) {
        if (event.TranscriptEvent?.Transcript?.Results) {
          for (const result of event.TranscriptEvent.Transcript.Results) {
            if (result.Alternatives?.[0]?.Transcript) {
              onTranscript(result.Alternatives[0].Transcript, !result.IsPartial);
            }
          }
        }
      }
    }
  }

  stopTranscription() {
    if (this.stream) {
      this.stream = null;
    }
  }
}

export const transcribeService = new TranscribeService();