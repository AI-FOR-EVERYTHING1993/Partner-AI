"use client"

import React, { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface NovaInterviewAIProps {
  interviewData?: any;
  onResponse?: (response: string) => void;
}

const NovaInterviewAI = ({ interviewData, onResponse }: NovaInterviewAIProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize WebSocket connection and audio
  useEffect(() => {
    initializeConnection();
    return () => {
      cleanup();
    };
  }, []);

  // Start interview when component loads
  useEffect(() => {
    if (isConnected && !hasStarted && interviewData) {
      startInterview();
    }
  }, [isConnected, interviewData, hasStarted]);

  const initializeConnection = async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Connect to WebSocket server
      socketRef.current = io('http://localhost:3001', {
        transports: ['websocket']
      });

      setupSocketListeners();
      
      // Initialize session
      socketRef.current.emit('initializeConnection', (response: any) => {
        if (response.success) {
          setIsConnected(true);
          setConnectionStatus('Connected');
        } else {
          setConnectionStatus('Connection failed');
        }
      });

    } catch (error) {
      console.error('Failed to initialize connection:', error);
      setConnectionStatus('Failed to connect');
    }
  };

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    socketRef.current.on('connect', () => {
      console.log('Connected to Nova Sonic server');
      setConnectionStatus('Connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    socketRef.current.on('textOutput', (data: any) => {
      const text = data.content || data.text || '';
      setAiResponse(text);
      if (onResponse) onResponse(text);
    });

    socketRef.current.on('audioOutput', (data: any) => {
      playAudioResponse(data);
    });

    socketRef.current.on('contentStart', () => {
      setIsAISpeaking(true);
    });

    socketRef.current.on('contentEnd', () => {
      setIsAISpeaking(false);
      // Start listening after AI finishes speaking
      setTimeout(() => {
        if (!isListening) {
          startListening();
        }
      }, 1000);
    });

    socketRef.current.on('error', (error: any) => {
      console.error('Socket error:', error);
      setConnectionStatus('Error: ' + error.message);
    });

    socketRef.current.on('sessionClosed', () => {
      setConnectionStatus('Session ended');
    });
  };

  const startInterview = async () => {
    if (!socketRef.current || !interviewData) return;

    setHasStarted(true);
    setConnectionStatus('Starting interview...');

    try {
      // Setup system prompt for interview
      const systemPrompt = `You are an AI interviewer conducting a ${interviewData.role} interview for a ${interviewData.level} level position. 
      Focus on ${interviewData.techstack.join(', ')}. 
      Be professional, encouraging, and ask relevant technical questions. 
      Keep responses conversational and under 100 words.
      Start with a warm greeting and ask the candidate to introduce themselves.`;

      // Initialize the session
      socketRef.current.emit('promptStart');
      socketRef.current.emit('systemPrompt', systemPrompt);
      socketRef.current.emit('audioStart');

      setConnectionStatus('Interview started');
    } catch (error) {
      console.error('Error starting interview:', error);
      setConnectionStatus('Failed to start interview');
    }
  };

  const startListening = async () => {
    if (!audioContextRef.current || isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioData = new Uint8Array(arrayBuffer);
        
        // Convert to base64 and send to server
        const base64Audio = btoa(String.fromCharCode(...audioData));
        if (socketRef.current) {
          socketRef.current.emit('audioInput', base64Audio);
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsListening(true);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      setConnectionStatus('Microphone access denied');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playAudioResponse = async (audioData: any) => {
    try {
      if (!audioContextRef.current) return;

      // Decode base64 audio data
      const binaryString = atob(audioData.content || audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode and play audio
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      setIsAISpeaking(true);
      source.onended = () => {
        setIsAISpeaking(false);
      };

    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const endInterview = () => {
    if (socketRef.current) {
      socketRef.current.emit('stopAudio');
    }
    
    const interviewResults = {
      overallScore: Math.floor(Math.random() * 30) + 70,
      duration: "12 minutes",
      questionsAnswered: 5,
      completedAt: new Date().toISOString(),
      transcript: aiResponse
    };
    
    sessionStorage.setItem('interviewResults', JSON.stringify(interviewResults));
    window.location.href = '/interview-results';
  };

  const cleanup = () => {
    stopListening();
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <div className="nova-interview-ai p-6 text-center">
      <div className="mb-4">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isAISpeaking ? 'bg-blue-500 animate-pulse' : 
          isListening ? 'bg-red-500 animate-pulse' : 
          isConnected ? 'bg-green-500' : 'bg-gray-500'
        }`}>
          <span className="text-white text-2xl">
            {isAISpeaking ? '🗣️' : isListening ? '🎤' : isConnected ? '🤖' : '⏳'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold">
          Status: {connectionStatus}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {isAISpeaking ? 'AI is speaking...' : 
           isListening ? 'Listening to your response...' : 
           isConnected ? 'Ready for conversation' : 'Connecting...'}
        </p>
      </div>

      {transcript && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <strong className="text-blue-800">You:</strong> 
          <span className="text-blue-700">{transcript}</span>
        </div>
      )}

      {aiResponse && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
          <strong className="text-green-800">AI Interviewer:</strong> 
          <span className="text-green-700">{aiResponse}</span>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button 
          onClick={isListening ? stopListening : startListening}
          disabled={!isConnected || isAISpeaking}
          className={`px-4 py-2 rounded text-white disabled:opacity-50 ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isListening ? 'Stop' : 'Start'} Speaking
        </button>
        
        <button 
          onClick={endInterview}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
        >
          End Interview
        </button>
      </div>

      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            Make sure the Nova Sonic server is running on port 3001
          </p>
        </div>
      )}
    </div>
  );
};

export default NovaInterviewAI;