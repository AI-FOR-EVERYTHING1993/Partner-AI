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
      // Start Nova session via API
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
        
        // Add initial AI message
        if (data.initialMessage) {
          setMessages([{ speaker: 'ai', text: data.initialMessage }]);
          // Convert to speech and play
          await speakText(data.initialMessage);
        }
      }
    } catch (error) {
      console.error('Failed to connect to Nova:', error);
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/polly/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Joanna' })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Start listening after AI finishes speaking
          setTimeout(() => startListening(), 1000);
        };
        
        await audio.play();
      } else {
        setIsSpeaking(false);
        setTimeout(() => startListening(), 1000);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      setTimeout(() => startListening(), 1000);
    }
  };

  const processUserSpeech = async (transcript: string) => {
    try {
      // Add user message to conversation
      const userMessage = { speaker: 'user' as const, text: transcript };
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response via Bedrock
      const response = await fetch('/api/bedrock/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          interviewData
        })
      });
      
      const data = await response.json();
      if (data.success && data.response) {
        const aiMessage = { speaker: 'ai' as const, text: data.response };
        setMessages(prev => [...prev, aiMessage]);
        
        if (onResponse) onResponse(data.response);
        
        // Convert AI response to speech
        await speakText(data.response);
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      const fallbackMessage = "I'm sorry, I didn't catch that. Could you please repeat?";
      setMessages(prev => [...prev, { speaker: 'ai', text: fallbackMessage }]);
      await speakText(fallbackMessage);
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

      let audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        processAudioInput(audioBlob);
        audioChunks = [];
      };

      mediaRecorder.start();
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

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      // Convert speech to text using Web Speech API
      const transcript = await speechToText(audioBlob);
      if (transcript) {
        await processUserSpeech(transcript);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };
  
  const speechToText = (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      
      recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };
      
      recognition.start();
    });
  };



  const disconnectFromNova = async () => {
    try {
      if (sessionId) {
        await fetch('/api/nova-sonic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'end',
            sessionId
          })
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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