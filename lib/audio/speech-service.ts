import { transcribeService } from './transcribe-service';
import { pollyService } from './polly-service';
import { createVAD } from './vad-service';
import { enterpriseModelService } from '../enterprise';

export interface SpeechToSpeechOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onStateChange?: (state: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  onVolumeChange?: (volume: number) => void;
  context?: any;
}

export class SpeechToSpeechService {
  private mediaStream: MediaStream | null = null;
  private vad: any = null;
  private currentTranscript = '';
  private isProcessing = false;
  private state: 'idle' | 'listening' | 'processing' | 'speaking' = 'idle';
  private options: SpeechToSpeechOptions = {};

  async start(options: SpeechToSpeechOptions = {}): Promise<void> {
    this.options = options;
    this.setState('listening');

    // Start transcription
    this.mediaStream = await transcribeService.startTranscription(
      (text, isFinal) => this.handleTranscript(text, isFinal)
    );

    // Start voice activity detection
    this.vad = createVAD({
      onSpeechStart: () => {
        this.currentTranscript = '';
        pollyService.stop(); // Stop any current speech
      },
      onSpeechEnd: () => this.processTranscript(),
      onVolumeChange: (volume) => this.options.onVolumeChange?.(volume)
    });

    await this.vad.start(this.mediaStream);
  }

  private handleTranscript(text: string, isFinal: boolean): void {
    if (isFinal) {
      this.currentTranscript = text;
    }
    this.options.onTranscript?.(text, isFinal);
  }

  private async processTranscript(): Promise<void> {
    if (!this.currentTranscript.trim() || this.isProcessing) return;

    this.isProcessing = true;
    this.setState('processing');

    try {
      const response = await enterpriseModelService.conductInterview(
        this.currentTranscript,
        this.options.context
      );

      if (response.success) {
        this.setState('speaking');
        this.options.onResponse?.(response.content);
        
        const ssml = pollyService.formatInterviewResponse(response.content);
        await pollyService.speakWithSSML(ssml);
        
        this.setState('listening');
      }
    } catch (error) {
      console.error('Speech processing error:', error);
      this.setState('listening');
    } finally {
      this.isProcessing = false;
      this.currentTranscript = '';
    }
  }

  private setState(newState: typeof this.state): void {
    this.state = newState;
    this.options.onStateChange?.(newState);
  }

  stop(): void {
    transcribeService.stopTranscription();
    pollyService.stop();
    this.vad?.stop();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    this.setState('idle');
    this.isProcessing = false;
    this.currentTranscript = '';
  }

  getState(): typeof this.state {
    return this.state;
  }

  async speakText(text: string): Promise<void> {
    const ssml = pollyService.formatInterviewResponse(text);
    await pollyService.speakWithSSML(ssml);
  }
}

export const speechToSpeechService = new SpeechToSpeechService();