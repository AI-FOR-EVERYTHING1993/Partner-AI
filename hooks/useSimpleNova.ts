"use client"

import { useState, useRef, useCallback } from 'react';

interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

type ConnectionState = 'disconnected' | 'connected' | 'listening' | 'processing' | 'speaking' | 'error';

interface InterviewContext {
  role?: string;
  level?: string;
  techstack?: string[];
  type?: string;
}

interface UseSimpleNovaOptions {
  interviewContext?: InterviewContext;
  onError?: (error: string) => void;
}

export function useSimpleNova(options: UseSimpleNovaOptions = {}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const connect = useCallback(async () => {
    setConnectionState('connected');
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Add user message
        const userEntry: TranscriptEntry = {
          id: Date.now().toString(),
          role: 'user',
          text: transcript,
          timestamp: new Date(),
          isFinal: true,
        };
        setTranscripts(prev => [...prev, userEntry]);
        
        // Get AI response
        setConnectionState('processing');
        try {
          const response = await fetch('/api/voice-interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'respond',
              message: transcript,
              context: options.interviewContext
            })
          });
          
          const data = await response.json();
          if (data.success) {
            const aiEntry: TranscriptEntry = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              text: data.response,
              timestamp: new Date(),
              isFinal: true,
            };
            setTranscripts(prev => [...prev, aiEntry]);
            
            // Speak the response
            setConnectionState('speaking');
            const utterance = new SpeechSynthesisUtterance(data.response);
            utterance.rate = 0.9;
            utterance.onend = () => setConnectionState('connected');
            speechSynthesis.speak(utterance);
          }
        } catch (err: any) {
          setError(err.message);
          setConnectionState('error');
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        setError('Speech recognition error: ' + event.error);
        setConnectionState('error');
      };
      
      recognitionRef.current.onend = () => {
        if (connectionState === 'listening') {
          setConnectionState('connected');
        }
      };
    }
    
    // Add welcome message
    try {
      const response = await fetch('/api/voice-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          context: options.interviewContext
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const welcome: TranscriptEntry = {
          id: Date.now().toString(),
          role: 'assistant',
          text: data.response,
          timestamp: new Date(),
          isFinal: true,
        };
        setTranscripts([welcome]);
        
        // Speak welcome message
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Failed to get welcome message:', err);
    }
  }, [options.interviewContext, connectionState]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setError(null);
      setConnectionState('listening');
      recognitionRef.current.start();
    } else {
      setError('Speech recognition not supported');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setConnectionState('connected');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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