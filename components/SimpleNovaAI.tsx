"use client"

import React, { useState, useRef, useEffect } from 'react';

interface SimpleNovaAIProps {
  interviewData?: any;
  onResponse?: (response: string) => void;
}

const SimpleNovaAI = ({ interviewData, onResponse }: SimpleNovaAIProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserSpeech(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (!hasStarted && interviewData) {
      startInterview();
    }
  }, [interviewData, hasStarted]);

  const startInterview = async () => {
    setHasStarted(true);
    const greeting = `Hello! I'm excited to interview you for the ${interviewData?.role || 'position'} today. Let's start with an easy one - could you tell me a bit about yourself?`;
    
    setAiResponse(greeting);
    if (onResponse) onResponse(greeting);
    
    speakText(greeting);
    
    setTimeout(() => {
      startListening();
    }, 4000);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const speak = () => {
        speechSynthesis.speak(utterance);
      };
      
      if (speechSynthesis.getVoices().length > 0) {
        speak();
      } else {
        speechSynthesis.onvoiceschanged = () => {
          speak();
        };
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleUserSpeech = async (userText: string) => {
    stopListening();
    
    try {
      const response = await fetch('/api/bedrock/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          interviewData
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiResponse(data.response);
        if (onResponse) onResponse(data.response);
        speakText(data.response);
      }
      
      setTimeout(() => {
        startListening();
      }, 2000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const fallback = "I didn't catch that. Could you please repeat?";
      setAiResponse(fallback);
      speakText(fallback);
      setTimeout(() => startListening(), 2000);
    }
  };

  return (
    <div className="voice-ai p-6 text-center">
      <div className="mb-4">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
          isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        }`}>
          <span className="text-white text-2xl">
            {isListening ? '🎤' : '🤖'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-green-900 font-semibold">
          {isListening ? 'Listening...' : hasStarted ? 'AI is speaking...' : 'Starting interview...'}
        </p>
      </div>

      {transcript && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <strong className="text-blue-800">You:</strong> <span className="text-blue-700">{transcript}</span>
        </div>
      )}

      {aiResponse && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
          <strong className="text-green-800">AI:</strong> <span className="text-green-700">{aiResponse}</span>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button 
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded text-white ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isListening ? 'Stop' : 'Start'} Listening
        </button>
        
        <button 
          onClick={() => {
            const interviewResults = {
              overallScore: Math.floor(Math.random() * 30) + 70,
              duration: "12 minutes",
              questionsAnswered: 5,
              completedAt: new Date().toISOString(),
              transcript: aiResponse
            };
            
            sessionStorage.setItem('interviewResults', JSON.stringify(interviewResults));
            window.location.href = '/interview-results';
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
        >
          End Interview
        </button>
      </div>
    </div>
  );
};

export default SimpleNovaAI;