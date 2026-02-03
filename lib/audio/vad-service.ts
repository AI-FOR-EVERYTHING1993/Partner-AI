export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isListening = false;
  private silenceThreshold = 30;
  private silenceDuration = 1500; // ms
  private lastSpeechTime = 0;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onVolumeChange?: (volume: number) => void;

  constructor(options?: {
    silenceThreshold?: number;
    silenceDuration?: number;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onVolumeChange?: (volume: number) => void;
  }) {
    if (options) {
      this.silenceThreshold = options.silenceThreshold ?? this.silenceThreshold;
      this.silenceDuration = options.silenceDuration ?? this.silenceDuration;
      this.onSpeechStart = options.onSpeechStart;
      this.onSpeechEnd = options.onSpeechEnd;
      this.onVolumeChange = options.onVolumeChange;
    }
  }

  async start(mediaStream: MediaStream): Promise<void> {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    const source = this.audioContext.createMediaStreamSource(mediaStream);
    source.connect(this.analyser);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.isListening = true;
    this.monitor();
  }

  private monitor(): void {
    if (!this.isListening || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    
    const volume = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    this.onVolumeChange?.(volume);

    const now = Date.now();
    const isSpeaking = volume > this.silenceThreshold;

    if (isSpeaking) {
      if (now - this.lastSpeechTime > this.silenceDuration) {
        this.onSpeechStart?.();
      }
      this.lastSpeechTime = now;
    } else if (now - this.lastSpeechTime > this.silenceDuration && this.lastSpeechTime > 0) {
      this.onSpeechEnd?.();
      this.lastSpeechTime = 0;
    }

    requestAnimationFrame(() => this.monitor());
  }

  stop(): void {
    this.isListening = false;
    this.audioContext?.close();
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
  }

  setThreshold(threshold: number): void {
    this.silenceThreshold = threshold;
  }

  setSilenceDuration(duration: number): void {
    this.silenceDuration = duration;
  }
}

export const createVAD = (options?: Parameters<typeof VoiceActivityDetector.prototype.constructor>[0]) => 
  new VoiceActivityDetector(options);