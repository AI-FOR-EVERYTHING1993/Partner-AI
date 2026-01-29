"use client"

import { useState, useRef, useCallback, useEffect } from 'react';

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

interface UseNovaS2SOptions {
  onUserTranscript?: (text: string) => void;
  onAssistantResponse?: (text: string) => void;
  interviewContext?: {
    role: string;
    level: string;
    techstack: string[];
  };
}

export const useNovaS2S = (options: UseNovaS2SOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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
      
      if (options.onAssistantResponse) {
        options.onAssistantResponse(welcomeMessage.text);
      }
      
      // Simulate AI speaking the welcome message
      // In production, this would come from Nova S2S audio output
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(welcomeMessage.text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Use a professional voice if available
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processAudio();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsListening(true);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  }, [isListening]);

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const base64Audio = await blobToBase64(audioBlob);

      // Send to API route
      const response = await fetch('/api/nova-s2s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          context: options.interviewContext,
          conversationHistory: transcripts,
        }),
      });

      const data = await response.json();

      // Add user transcript
      if (data.userTranscript) {
        setTranscripts(prev => [...prev, {
          role: 'user',
          text: data.userTranscript,
          timestamp: new Date(),
        }]);
        options.onUserTranscript?.(data.userTranscript);
      }

      // Add assistant response
      if (data.assistantText) {
        setTranscripts(prev => [...prev, {
          role: 'assistant',
          text: data.assistantText,
          timestamp: new Date(),
          audioUrl: data.audioUrl,
        }]);
        options.onAssistantResponse?.(data.assistantText);

        // Play audio response
        if (data.audioBase64) {
          await playAudio(data.audioBase64);
        }
      }

    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const playAudio = async (base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      await audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const clearTranscripts = () => {
    setTranscripts([]);
    setHasInitialized(false);
  };

  return {
    isListening,
    isProcessing,
    transcripts,
    currentTranscript,
    startListening,
    stopListening,
    clearTranscripts,
  };
};