// hooks/useSimpleNova.ts
"use client"

import { useState, useRef, useCallback } from 'react';
import { AudioPlayer, AudioRecorder } from '@/lib/nova/audio-utils';
import { TranscriptEntry, ConnectionState, InterviewContext } from '@/lib/nova/types';

interface UseSimpleNovaOptions {
  interviewContext?: InterviewContext;
  onError?: (error: string) => void;
}

export function useSimpleNova(options: UseSimpleNovaOptions = {}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  const connect = useCallback(async () => {
    setConnectionState('connected');
    audioRecorderRef.current = new AudioRecorder();
    audioPlayerRef.current = new AudioPlayer();
    
    // Add welcome message
    if (options.interviewContext) {
      const welcome: TranscriptEntry = {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Hello! Welcome to your ${options.interviewContext.role} interview. I'm excited to learn about your experience with ${options.interviewContext.techstack.join(', ')}. Let's start - tell me about yourself.`,
        timestamp: new Date(),
        isFinal: true,
      };
      setTranscripts([welcome]);
    }
  }, [options.interviewContext]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setConnectionState('listening');
      await audioRecorderRef.current?.start();
    } catch (err: any) {
      setError(err.message);
      setConnectionState('error');
      options.onError?.(err.message);
    }
  }, [options]);

  const stopListening = useCallback(async () => {
    if (!audioRecorderRef.current?.isRecording()) return;

    setConnectionState('processing');

    try {
      const audioBase64 = await audioRecorderRef.current.stop();
      
      const response = await fetch('/api/nova-s2s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: audioBase64,
          context: options.interviewContext,
          conversationHistory: transcripts.map(t => ({ role: t.role, text: t.text })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio');
      }

      // Add user transcript
      if (data.userTranscript) {
        const userEntry: TranscriptEntry = {
          id: Date.now().toString(),
          role: 'user',
          text: data.userTranscript,
          timestamp: new Date(),
          isFinal: true,
        };
        setTranscripts(prev => [...prev, userEntry]);
      }

      // Add assistant response
      if (data.assistantText) {
        setConnectionState('speaking');
        const assistantEntry: TranscriptEntry = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.assistantText,
          timestamp: new Date(),
          isFinal: true,
        };
        setTranscripts(prev => [...prev, assistantEntry]);

        // Play audio if available
        if (data.audioBase64) {
          await audioPlayerRef.current?.playBase64Audio(data.audioBase64);
        } else {
          // Fallback to speech synthesis
          const utterance = new SpeechSynthesisUtterance(data.assistantText);
          utterance.rate = 0.9;
          utterance.onend = () => setConnectionState('connected');
          speechSynthesis.speak(utterance);
        }
      }

      if (!data.audioBase64) {
        setConnectionState('connected');
      }

    } catch (err: any) {
      setError(err.message);
      setConnectionState('error');
      options.onError?.(err.message);
    }
  }, [options, transcripts]);

  const disconnect = useCallback(() => {
    audioRecorderRef.current?.stopRecording();
    audioPlayerRef.current?.stop();
    speechSynthesis.cancel();
    setConnectionState('disconnected');
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setError(null);
  }, []);

  return {
    connectionState,
    transcripts,
    error,
    isConnected: connectionState !== 'disconnected' && connectionState !== 'error',
    isListening: connectionState === 'listening',
    isProcessing: connectionState === 'processing',
    isSpeaking: connectionState === 'speaking',
    connect,
    disconnect,
    startListening,
    stopListening,
    clearTranscripts,
  };
}