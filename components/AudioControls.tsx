'use client';

import { useState, useEffect, useRef } from 'react';
import { speechToSpeechService } from '@/lib/audio';

interface AudioControlsProps {
  context?: any;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  className?: string;
}

export default function AudioControls({ context, onTranscript, onResponse, className = '' }: AudioControlsProps) {
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawWaveform();
  }, [volume]);

  const startListening = async () => {
    try {
      setError(null);
      await speechToSpeechService.start({
        context,
        onTranscript: (text, isFinal) => {
          setTranscript(text);
          onTranscript?.(text, isFinal);
        },
        onResponse: (text) => {
          onResponse?.(text);
        },
        onStateChange: setState,
        onVolumeChange: setVolume
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start audio');
    }
  };

  const stopListening = () => {
    speechToSpeechService.stop();
    setTranscript('');
    setVolume(0);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height / 2;
    const amplitude = (volume / 100) * centerY;
    
    ctx.strokeStyle = state === 'listening' ? '#10b981' : '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x += 4) {
      const y = centerY + Math.sin((x + Date.now() * 0.01) * 0.02) * amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  };

  const getStateColor = () => {
    switch (state) {
      case 'listening': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Ready';
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg ${className}`}>
      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <button
          onClick={state === 'idle' ? startListening : stopListening}
          disabled={state === 'processing' || state === 'speaking'}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold transition-all ${
            state === 'idle' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {state === 'idle' ? '🎤' : '⏹️'}
        </button>
        
        <div className="flex flex-col items-center">
          <div className={`w-3 h-3 rounded-full ${getStateColor()} animate-pulse`}></div>
          <span className="text-sm text-gray-600 mt-1">{getStateText()}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={60}
        className="border rounded bg-gray-50"
      />

      {transcript && (
        <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>You said:</strong> {transcript}
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        {state === 'idle' && 'Click the microphone to start voice interview'}
        {state === 'listening' && 'Speak naturally, I\'ll respond when you pause'}
        {state === 'processing' && 'Analyzing your response...'}
        {state === 'speaking' && 'Listen to my response'}
      </div>
    </div>
  );
}