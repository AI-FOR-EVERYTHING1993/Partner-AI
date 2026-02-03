// components/SimpleSpeechTest.tsx
"use client"

import React, { useState, useRef } from 'react';

const SimpleSpeechTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError('');
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

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 10000);

    } catch (err: any) {
      setError(`Recording failed: ${err.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Use browser speech recognition
      const transcript = await speechToText();
      
      if (!transcript) {
        setError('No speech detected');
        return;
      }
      
      const testContext = {
        role: "Software Engineer",
        level: "Senior",
        techstack: ["React", "TypeScript"],
        type: "technical" as const
      };

      const response = await fetch('/api/nova-s2s', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcript,
          context: testContext
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTranscript(data.userTranscript || transcript);
        setResponse(data.assistantText || 'No response available');
        
        if (data.audioBase64) {
          await playAudioBase64(data.audioBase64);
        } else {
          speakText(data.assistantText);
        }
      } else {
        setError(`API Error: ${data.error}`);
      }
    } catch (err: any) {
      setError(`Processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const speechToText = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
      
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

  const playAudioBase64 = async (base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => URL.revokeObjectURL(audioUrl);
      await audio.play();
    } catch (err) {
      console.error('Audio playback failed:', err);
      // Fallback to text-to-speech
      speakText(response);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Speech-to-Speech Test</h2>
      
      {/* Status Indicator */}
      <div className="text-center mb-6">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
          isProcessing ? 'bg-yellow-500 animate-pulse' :
          isRecording ? 'bg-red-500 animate-pulse' : 
          'bg-green-500'
        }`}>
          <span className="text-3xl text-white">
            {isProcessing ? '⏳' : isRecording ? '🎤' : '🤖'}
          </span>
        </div>
        <p className="text-lg font-semibold">
          {isProcessing ? 'Processing (may take up to 60s)...' :
           isRecording ? 'Recording (10s max)' : 
           'Ready to record'}
        </p>
      </div>

      {/* Controls */}
      <div className="text-center mb-6">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`px-8 py-4 rounded-lg font-semibold text-white ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {transcript && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg">
          <h3 className="font-semibold text-blue-800">Your Speech:</h3>
          <p className="text-blue-700">{transcript}</p>
        </div>
      )}

      {response && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <h3 className="font-semibold text-green-800">AI Response:</h3>
          <p className="text-green-700">{response}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Instructions:</h4>
        <ul className="text-sm space-y-1">
          <li>• Click "Start Recording" and speak for up to 10 seconds</li>
          <li>• Processing may take up to 60 seconds</li>
          <li>• The system will transcribe your speech and generate an AI response</li>
          <li>• The AI response will be played back as audio</li>
          <li>• Check browser console for detailed error logs</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleSpeechTest;