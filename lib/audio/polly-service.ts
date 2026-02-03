import { SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { pollyClient } from '../aws-config';

export class PollyService {
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying = false;

  async speak(text: string, voiceId?: string): Promise<void> {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId || process.env.POLLY_VOICE_ID || 'Joanna',
      Engine: 'neural'
    });

    const response = await pollyClient.send(command);
    if (response.AudioStream) {
      const audioBlob = new Blob([await response.AudioStream.transformToByteArray()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      this.audioQueue.push(audio);
      
      if (!this.isPlaying) {
        this.playNext();
      }
    }
  }

  async speakWithSSML(ssml: string, voiceId?: string): Promise<void> {
    const command = new SynthesizeSpeechCommand({
      Text: ssml,
      TextType: 'ssml',
      OutputFormat: 'mp3',
      VoiceId: voiceId || process.env.POLLY_VOICE_ID || 'Joanna',
      Engine: 'neural'
    });

    const response = await pollyClient.send(command);
    if (response.AudioStream) {
      const audioBlob = new Blob([await response.AudioStream.transformToByteArray()], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      this.audioQueue.push(audio);
      
      if (!this.isPlaying) {
        this.playNext();
      }
    }
  }

  private playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audio = this.audioQueue.shift()!;
    
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      this.playNext();
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      this.playNext();
    };
    
    audio.play();
  }

  stop() {
    this.audioQueue.forEach(audio => {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    });
    this.audioQueue = [];
    this.isPlaying = false;
  }

  formatInterviewResponse(text: string): string {
    return `<speak><prosody rate="medium" pitch="medium">${text}</prosody></speak>`;
  }
}

export const pollyService = new PollyService();