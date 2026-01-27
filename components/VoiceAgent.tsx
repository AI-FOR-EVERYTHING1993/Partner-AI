"use client"

import React, { useState, useRef, useEffect } from 'react';

interface VoiceAgentProps {
  interviewData?: any;
  onResponse?: (response: string) => void;
  onInterviewEnd?: () => void;
}

const VoiceAgent = ({ interviewData, onResponse, onInterviewEnd }: VoiceAgentProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  // Initialize WebRTC audio capture
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };

  // Convert audio data and send to Nova Sonic
  const convertAndSendAudio = async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      if (sessionId) {
        const response = await fetch('/api/nova-sonic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'process',
            sessionId,
            audioData: Array.from(new Uint8Array(arrayBuffer))
          })
        });
        
        const data = await response.json();
        if (data.success && onResponse) {
          onResponse(data.response);
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  // Start audio capture
  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await initializeAudio();
      }

      // Start Nova Sonic session
      const response = await fetch('/api/nova-sonic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          interviewData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setIsConnected(true);
      }

      const mediaRecorder = new MediaRecorder(streamRef.current!, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isConnected) {
          convertAndSendAudio(event.data);
        }
      };

      mediaRecorder.start(100); // Capture every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (sessionId) {
      await fetch('/api/nova-sonic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          sessionId
        })
      });
      setSessionId(null);
      setIsConnected(false);
      
      // Call the interview end handler
      if (onInterviewEnd) {
        onInterviewEnd();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="voice-agent flex flex-col items-center gap-4 p-6">
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-8 py-4 rounded-full font-bold text-white transition-all ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        <span className="text-sm text-gray-600">
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Listening...
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;