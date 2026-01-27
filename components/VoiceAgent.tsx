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

  // Initialize WebSocket connection to Nova
  const connectToNova = async () => {
    try {
      const ws = new WebSocket('ws://localhost:8081');
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Nova WebSocket');
        setIsConnected(true);
        
        // Start Nova session
        ws.send(JSON.stringify({
          type: 'start_session',
          sessionId,
          interviewData
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleNovaMessage(data);
      };

      ws.onclose = () => {
        console.log('Disconnected from Nova');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to Nova:', error);
    }
  };

  const handleNovaMessage = (data) => {
    switch (data.type) {
      case 'session_started':
        console.log('Nova session started');
        // The initial greeting will be sent automatically by the server
        break;
      case 'audio_output':
        playAudioResponse(data.audio);
        break;
      case 'text_output':
        console.log('AI says:', data.text);
        if (onResponse) {
          onResponse(data.text);
        }
        break;
      case 'error':
        console.error('Nova error:', data.message);
        break;
    }
  };

  const playAudioResponse = (audioData) => {
    try {
      const audioBlob = new Blob([new Uint8Array(atob(audioData).split('').map(c => c.charCodeAt(0)))], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Start audio capture
  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        await initializeAudio();
      }

      // Connect to Nova WebSocket
      await connectToNova();

      const mediaRecorder = new MediaRecorder(streamRef.current!, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          // Convert and send audio to Nova via WebSocket
          convertAndSendAudio(event.data);
        }
      };

      mediaRecorder.start(100); // Capture every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const convertAndSendAudio = async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'audio_input',
          audioData: base64Audio
        }));
      }
    } catch (error) {
      console.error('Error converting audio:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'end_session'
      }));
      websocketRef.current.close();
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