"use client"

import React, { useState, useRef, useEffect } from 'react';

interface NovaVoiceInterviewerProps {
  interviewData?: any;
  onResponse?: (response: string) => void;
}

const NovaVoiceInterviewer = ({ interviewData, onResponse }: NovaVoiceInterviewerProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{speaker: 'ai' | 'user', text: string}>>([]);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Nova connection when component mounts
  useEffect(() => {
    if (interviewData) {
      connectToNova();
    }
    return () => {
      disconnectFromNova();
    };
  }, [interviewData]);

  const connectToNova = async () => {
    try {
      // Connect to Nova WebSocket server
      const ws = new WebSocket('ws://localhost:8081'); // Nova server
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Nova AI');
        setIsConnected(true);
        initializeNovaSession();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleNovaResponse(data);
      };

      ws.onclose = () => {
        console.log('Disconnected from Nova AI');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('Nova WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to Nova:', error);
    }
  };

  const initializeNovaSession = () => {
    if (!websocketRef.current) return;

    const sessionData = {
      type: 'start_session',
      sessionId: `interview_${Date.now()}`,
      interviewData: {
        role: interviewData?.role || 'Software Developer',
        level: interviewData?.level || 'Senior',
        techstack: interviewData?.techstack || ['JavaScript', 'React'],
        systemPrompt: `You are an AI interviewer for a ${interviewData?.role} position. 
        Start immediately with: "Hello! I'm excited to interview you for the ${interviewData?.role} position today. 
        Let's begin - could you tell me about yourself and your experience with ${interviewData?.techstack?.join(', ')}?"
        
        Keep responses conversational, under 50 words, and ask one question at a time.`
      }
    };

    websocketRef.current.send(JSON.stringify(sessionData));
    setSessionId(sessionData.sessionId);
  };

  const handleNovaResponse = (data: any) => {
    switch (data.type) {
      case 'session_started':
        console.log('Nova session started');
        break;
        
      case 'ai_speaking':
        setIsSpeaking(true);
        break;
        
      case 'ai_finished_speaking':
        setIsSpeaking(false);
        // Start listening for user response
        setTimeout(() => {
          startListening();
        }, 1000);
        break;
        
      case 'text_response':
        const aiMessage = { speaker: 'ai' as const, text: data.text };
        setMessages(prev => [...prev, aiMessage]);
        if (onResponse) onResponse(data.text);
        break;
        
      case 'audio_response':
        // Play Nova's audio response
        playNovaAudio(data.audioData);
        break;
        
      case 'error':
        console.error('Nova error:', data.message);
        break;
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          sendAudioToNova(event.data);
        }
      };

      mediaRecorder.start(1000); // Send chunks every second
      setIsListening(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        stopListening();
      }, 10000);

    } catch (error) {
      console.error('Error starting audio capture:', error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioToNova = async (audioBlob: Blob) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const audioMessage = {
        type: 'audio_input',
        sessionId,
        audioData: base64Audio,
        format: 'webm'
      };

      websocketRef.current.send(JSON.stringify(audioMessage));
    } catch (error) {
      console.error('Error sending audio to Nova:', error);
    }
  };

  const playNovaAudio = (audioData: string) => {
    try {
      const audioBlob = new Blob([
        new Uint8Array(atob(audioData).split('').map(c => c.charCodeAt(0)))
      ], { type: 'audio/wav' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // Start listening after AI finishes speaking
        setTimeout(() => startListening(), 500);
      };
      
      audio.play();
    } catch (error) {
      console.error('Error playing Nova audio:', error);
    }
  };

  const disconnectFromNova = () => {
    if (websocketRef.current) {
      websocketRef.current.send(JSON.stringify({
        type: 'end_session',
        sessionId
      }));
      websocketRef.current.close();
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const endInterview = () => {
    disconnectFromNova();
    
    // Save interview data and redirect to results
    const interviewResults = {
      overallScore: Math.floor(Math.random() * 30) + 70,
      duration: "15 minutes",
      questionsAnswered: messages.filter(m => m.speaker === 'ai').length,
      transcript: messages.map(m => `${m.speaker}: ${m.text}`).join('\\n'),
      completedAt: new Date().toISOString()
    };
    
    sessionStorage.setItem('interviewResults', JSON.stringify(interviewResults));
    window.location.href = '/interview-results';
  };

  return (
    <div className="nova-voice-interviewer p-6">
      {/* Connection Status */}
      <div className="status-indicator mb-6 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
          isSpeaking ? 'bg-blue-500 animate-pulse' :
          isListening ? 'bg-red-500 animate-pulse' :
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`}>
          <span className="text-2xl text-white">
            {isSpeaking ? '🗣️' : isListening ? '👂' : isConnected ? '🤖' : '⏳'}
          </span>
        </div>
        
        <p className="text-lg font-semibold">
          {isSpeaking ? 'Nova AI is speaking...' :
           isListening ? 'Listening to your response...' :
           isConnected ? 'Nova AI Ready' : 'Connecting to Nova AI...'}
        </p>
      </div>

      {/* Conversation History */}
      <div className="conversation-history mb-6 max-h-64 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-3 p-3 rounded-lg ${
            message.speaker === 'ai' 
              ? 'bg-blue-100 border-l-4 border-blue-500' 
              : 'bg-green-100 border-l-4 border-green-500'
          }`}>
            <strong className={message.speaker === 'ai' ? 'text-blue-700' : 'text-green-700'}>
              {message.speaker === 'ai' ? 'Nova AI' : 'You'}:
            </strong>
            <p className="mt-1">{message.text}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="controls text-center space-x-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!isConnected || isSpeaking}
          className={`px-6 py-3 rounded-lg font-semibold ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? 'Stop Speaking' : 'Start Speaking'}
        </button>
        
        <button
          onClick={endInterview}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
        >
          End Interview
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
        <h4 className="font-semibold text-yellow-800">How it works:</h4>
        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>• Nova AI will speak first with a greeting and question</li>
          <li>• Click "Start Speaking" to respond when Nova finishes</li>
          <li>• Nova will automatically ask follow-up questions</li>
          <li>• The interview continues until you click "End Interview"</li>
        </ul>
      </div>
    </div>
  );
};

export default NovaVoiceInterviewer;