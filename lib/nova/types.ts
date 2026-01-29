// lib/nova/types.ts

export interface NovaSessionConfig {
  region: string;
  modelId: string;
  voiceId: string;
  sampleRate: number;
  systemPrompt: string;
  interviewContext?: InterviewContext;
}

export interface InterviewContext {
  role: string;
  level: string;
  techstack: string[];
  type: 'technical' | 'behavioral' | 'mixed';
}

export interface NovaEvent {
  event: {
    contentBlockDelta?: {
      delta: {
        text?: string;
        audio?: {
          data: string; // base64
        };
      };
    };
    contentBlockStop?: object;
    messageStop?: object;
    metadata?: {
      usage: {
        inputTokens: number;
        outputTokens: number;
      };
      metrics: {
        latencyMs: number;
      };
    };
  };
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioData?: string;
  confidence?: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  encoding: 'pcm' | 'opus' | 'webm';
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface NovaResponse {
  userTranscript: string;
  assistantText: string;
  audioBase64: string | null;
  confidence?: number;
  processingTime?: number;
}

export interface InterviewSession {
  id: string;
  context: InterviewContext;
  startTime: Date;
  endTime?: Date;
  transcripts: TranscriptEntry[];
  status: 'active' | 'paused' | 'completed' | 'error';
}

export interface AudioMetrics {
  volume: number;
  clarity: number;
  duration: number;
}