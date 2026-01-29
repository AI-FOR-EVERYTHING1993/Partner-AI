"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Agent from '@/components/Agent';
import { useSimpleNova } from '@/hooks/useSimpleNova';
import { TECHNICAL_INTERVIEWS, NON_TECHNICAL_INTERVIEWS, EXPERIENCE_LEVELS } from '@/constants/interviews';

interface InterviewData {
  role: string;
  level: string;
  techstack: string[];
  type: 'technical' | 'non-technical';
  category: string;
}

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const InterviewPage = () => {
  const searchParams = useSearchParams();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  
  const {
    connectionState,
    transcripts,
    error,
    isConnected,
    isListening,
    isProcessing,
    isSpeaking,
    connect,
    disconnect,
    startListening,
    stopListening,
    clearTranscripts,
  } = useSimpleNova({
    interviewContext: interviewData ? {
      role: interviewData.role,
      level: interviewData.level,
      techstack: interviewData.techstack,
      type: interviewData.type,
    } : undefined,
    onError: (err) => console.error('Nova error:', err),
  });

  useEffect(() => {
    if (!searchParams) return;
    
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const type = searchParams.get('type') as 'technical' | 'non-technical';
    const skills = searchParams.get('skills');

    if (category && level) {
      const allInterviews = [...TECHNICAL_INTERVIEWS, ...NON_TECHNICAL_INTERVIEWS];
      const selectedInterview = allInterviews.find(i => i.id === category);
      const selectedLevel = EXPERIENCE_LEVELS.find(l => l.id === level);

      if (selectedInterview && selectedLevel) {
        const techstack = skills ? skills.split(',') : 
          (type === 'technical' ? ['JavaScript', 'React', 'Node.js'] : ['Communication', 'Leadership']);

        const newInterviewData = {
          role: selectedInterview.name,
          level: selectedLevel.name,
          techstack,
          type: type || 'technical',
          category
        };
        
        setInterviewData(newInterviewData);
      }
    }
  }, [searchParams]);

  if (!interviewData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            Loading Interview...
          </div>
          <div className="text-gray-400">
            Preparing your personalized interview experience
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            {interviewData.role} Interview
          </h1>
          <p className="text-gray-400 mb-2">
            {interviewData.level} Level • {interviewData.type === 'technical' ? 'Technical' : 'Non-Technical'}
          </p>
          <p className="text-sm text-gray-500">
            Focus: {interviewData.techstack.join(', ')}
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            connectionState === 'connected' ? 'bg-green-900 text-green-300' :
            connectionState === 'listening' ? 'bg-red-900 text-red-300' :
            connectionState === 'processing' ? 'bg-blue-900 text-blue-300' :
            connectionState === 'speaking' ? 'bg-purple-900 text-purple-300' :
            connectionState === 'error' ? 'bg-red-900 text-red-300' :
            'bg-gray-700 text-gray-300'
          }`}>
            {connectionState === 'connected' && '🟢 Ready'}
            {connectionState === 'listening' && '🔴 Listening...'}
            {connectionState === 'processing' && '🔵 Processing...'}
            {connectionState === 'speaking' && '🟣 Speaking...'}
            {connectionState === 'error' && '🔴 Error'}
            {connectionState === 'disconnected' && '⚪ Disconnected'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center">
            <p className="text-red-300">⚠️ {error}</p>
          </div>
        )}

        {/* Speech Controls */}
        <div className="flex gap-4 mb-6 justify-center">
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
            >
              🎙️ Start Interview
            </button>
          ) : (
            <>
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isSpeaking}
                className={`px-8 py-4 rounded-lg font-semibold transition-all ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                    : isProcessing || isSpeaking
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isListening ? '⏹️ Stop' : isProcessing ? '⏳ Processing...' : isSpeaking ? '🔊 Speaking...' : '🎤 Speak'}
              </button>

              <button
                onClick={disconnect}
                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
              >
                ✖️ End
              </button>
            </>
          )}
        </div>



        {/* Conversation Transcript */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              📝 Interview Transcript
              <span className="ml-2 text-sm text-gray-400">
                ({transcripts.length} messages)
              </span>
            </h2>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transcripts.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-5xl mb-4">🎤</div>
                <p className="text-lg">Ready to start your interview</p>
                <p className="text-sm mt-2">Click "Start Interview" to begin</p>
              </div>
            ) : (
              transcripts.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg ${
                    entry.role === 'user'
                      ? 'bg-blue-900/30 border-l-4 border-blue-500 ml-4'
                      : 'bg-gray-700/50 border-l-4 border-green-500 mr-4'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{entry.role === 'user' ? '👤' : '🤖'}</span>
                    <span className="font-medium">
                      {entry.role === 'user' ? 'You' : 'Interviewer'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-200">{entry.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Export */}
          {transcripts.length > 0 && (
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => {
                  const text = transcripts
                    .map(t => `[${t.role.toUpperCase()}]: ${t.text}`)
                    .join('\n\n');
                  navigator.clipboard.writeText(text);
                  alert('Transcript copied!');
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                📋 Copy Transcript
              </button>
              <button
                onClick={clearTranscripts}
                className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg"
              >
                🗑️ Clear
              </button>
              <button
                onClick={() => {
                  const interviewResults = {
                    overallScore: Math.floor(Math.random() * 30) + 70,
                    duration: "12 minutes",
                    questionsAnswered: transcripts.length,
                    completedAt: new Date().toISOString(),
                    transcript: transcripts.map(t => `${t.role}: ${t.text}`).join('\n')
                  };
                  
                  sessionStorage.setItem('interviewResults', JSON.stringify(interviewResults));
                  window.location.href = '/interview-results';
                }}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                ✅ End & View Results
              </button>
            </div>
          )}
        </div>

        {/* Original Agent Component */}
        <div className="bg-gray-800 rounded-lg p-6">
          <Agent />
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;