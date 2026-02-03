"use client"

import React, { useState, useRef, useCallback } from 'react';

interface AudioCaptureProps {
  onAudioData: (audioData: ArrayBuffer) => void;
  isRecording: boolean;
}

export const AudioCapture = ({ onAudioData, isRecording }: AudioCaptureProps) => {
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          event.data.arrayBuffer().then(onAudioData);
        }
      };
      
      mediaRecorder.start(100); // Capture every 100ms
      mediaRecorderRef.current = mediaRecorder;
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsSupported(false);
    }
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Auto start/stop based on isRecording prop
  React.useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  if (!isSupported) {
    return (
      <div className="text-red-500 text-sm">
        Microphone access not supported or denied
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
      }`} />
      <span className="text-sm text-gray-600">
        {isRecording ? 'Recording...' : 'Ready'}
      </span>
    </div>
  );
};