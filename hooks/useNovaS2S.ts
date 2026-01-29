"use client"

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioPlayer, AudioRecorder } from '@/lib/nova/audio-utils';
import { TranscriptEntry, ConnectionState, InterviewContext } from '@/lib/nova/types';

interface UseNovaS2SOptions {
  onUserTranscript?: (text: string) => void;
  onAssistantResponse?: (text: string) => void;
  onError?: (error: string) => void;
  interviewContext?: InterviewContext;
}

export const useNovaS2S = (options: UseNovaS2SOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  // Initialize audio components
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder();
    audioPlayerRef.current = new AudioPlayer();

    return () => {
      audioPlayerRef.current?.stop();
    };
  }, []);

  // Add welcome message when interview context is available
  useEffect(() => {
    if (options.interviewContext && !hasInitialized) {
      const welcomeMessage: TranscriptEntry = {
        role: 'assistant',
        text: `Hello! Welcome to your ${options.interviewContext.role} interview. I'm excited to learn more about your experience with ${options.interviewContext.techstack.join(', ')}. Let's start with you telling me a bit about yourself and your background.`,
        timestamp: new Date()
      };
      
      setTranscripts([welcomeMessage]);
      setHasInitialized(true);
      
      options.onAssistantResponse?.(welcomeMessage.text);
      
      // Use browser speech synthesis as fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(welcomeMessage.text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const professionalVoice = voices.find(voice => 
          voice.name.includes('Microsoft') || voice.name.includes('Google')
        );
        if (professionalVoice) {
          utterance.voice = professionalVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
    }
  }, [options.interviewContext, hasInitialized, options.onAssistantResponse]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setConnectionState('connecting');
      setIsListening(true);
      await audioRecorderRef.current?.start();
      setConnectionState('connected');
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setIsListening(false);
      setConnectionState('error');
      options.onError?.(err.message);
    }
  }, [options]);

  const stopListening = useCallback(async () => {
    if (!audioRecorderRef.current?.isRecording()) return;

    setIsListening(false);
    setIsProcessing(true);

    try {
      const audioBase64 = await audioRecorderRef.current.stop();
      
      // Send to API
      const response = await fetch('/api/nova-s2s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: audioBase64,
          context: options.interviewContext,
          conversationHistory: transcripts.map((t) => ({
            role: t.role,
            text: t.text,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const data = await response.json();

      // Add user transcript
      if (data.userTranscript) {
        const userEntry: TranscriptEntry = {
          role: 'user',
          text: data.userTranscript,
          timestamp: new Date(),
        };
        setTranscripts((prev) => [...prev, userEntry]);
        options.onUserTranscript?.(data.userTranscript);
      }

      // Add assistant response
      if (data.assistantText) {
        const assistantEntry: TranscriptEntry = {
          role: 'assistant',
          text: data.assistantText,
          timestamp: new Date(),
        };
        setTranscripts((prev) => [...prev, assistantEntry]);
        options.onAssistantResponse?.(data.assistantText);

        // Play audio response
        if (data.audioBase64) {
          await audioPlayerRef.current?.playBase64Audio(data.audioBase64);
        }
      }
    } catch (err: any) {
      console.error('Error processing audio:', err);
      setError(err.message);
      options.onError?.(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [options, transcripts]);



  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setError(null);
    setHasInitialized(false);
  }, []);

  const addWelcomeMessage = useCallback((message: string) => {
    setTranscripts((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: message,
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    isListening,
    isProcessing,
    transcripts,
    connectionState,
    error,
    startListening,
    stopListening,
    clearTranscripts,
    addWelcomeMessage,
  };
};