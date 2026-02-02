"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const VoiceInterviewComponent = ({ interviewContext }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserResponse(finalTranscript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startInterview = async () => {
    try {
      const response = await fetch('/api/voice-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          context: interviewContext
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const aiResponse = data.response;
        setCurrentResponse(aiResponse);
        setConversation([{ type: 'ai', message: aiResponse }]);
        speakText(aiResponse);
        setInterviewStarted(true);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const handleUserResponse = async (userMessage) => {
    setConversation(prev => [...prev, { type: 'user', message: userMessage }]);
    
    try {
      const response = await fetch('/api/voice-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          message: userMessage,
          context: {
            ...interviewContext,
            transcript: conversation.map(c => `${c.type}: ${c.message}`).join('\\n')
          }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const aiResponse = data.response;
        setCurrentResponse(aiResponse);
        setConversation(prev => [...prev, { type: 'ai', message: aiResponse }]);
        speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error processing response:', error);
    }
    
    setTranscript('');
  };

  const speakText = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const endInterview = async () => {
    try {
      const response = await fetch('/api/voice-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          context: {
            transcript: conversation.map(c => `${c.type}: ${c.message}`).join('\\n')
          }
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const analysis = JSON.parse(data.response);
        // Store analysis and redirect to results
        sessionStorage.setItem('interviewAnalysis', JSON.stringify(analysis));
        window.location.href = '/interview-results';
      }
    } catch (error) {
      console.error('Error analyzing interview:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Voice Interview</h2>
        
        {!interviewStarted ? (
          <div className="text-center">
            <p className="mb-4">Ready to start your {interviewContext?.category} interview?</p>
            <Button onClick={startInterview} className="bg-blue-600 hover:bg-blue-700">
              Start Interview
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current AI Response */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Sarah (AI Interviewer):</h3>
              <p className="text-blue-700">{currentResponse}</p>
              {isSpeaking && (
                <div className="flex items-center mt-2 text-blue-600">
                  <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                  <span className="text-sm">Speaking...</span>
                </div>
              )}
            </div>

            {/* Voice Controls */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={startListening}
                disabled={isListening || isSpeaking}
                className={`${isListening ? 'bg-red-600' : 'bg-green-600'} hover:opacity-80`}
              >
                {isListening ? '🎤 Listening...' : '🎤 Start Speaking'}
              </Button>
              
              <Button
                onClick={stopListening}
                disabled={!isListening}
                variant="outline"
              >
                Stop
              </Button>
              
              <Button
                onClick={endInterview}
                variant="destructive"
                disabled={conversation.length < 4}
              >
                End Interview
              </Button>
            </div>

            {/* Live Transcript */}
            {transcript && (
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">You're saying: "{transcript}"</p>
              </div>
            )}

            {/* Conversation History */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.type === 'ai' 
                      ? 'bg-blue-50 border-l-4 border-blue-400' 
                      : 'bg-green-50 border-l-4 border-green-400'
                  }`}
                >
                  <span className="font-semibold">
                    {msg.type === 'ai' ? 'Sarah:' : 'You:'}
                  </span>
                  <p className="mt-1">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VoiceInterviewComponent;