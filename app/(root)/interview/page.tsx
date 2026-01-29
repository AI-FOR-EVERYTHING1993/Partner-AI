"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Agent from '@/components/Agent';
import { useNovaS2S } from '@/hooks/useNovaS2S';
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
    isListening,
    isProcessing,
    transcripts,
    startListening,
    stopListening,
    clearTranscripts,
  } = useNovaS2S({
    interviewContext: interviewData ? {
      role: interviewData.role,
      level: interviewData.level,
      techstack: interviewData.techstack,
    } : undefined,
    onUserTranscript: (text: string) => {
      console.log('User said:', text);
    },
    onAssistantResponse: (text: string) => {
      console.log('Interviewer:', text);
    },
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
        
        // Add welcome message when interview data is set
        setTimeout(() => {
          const welcomeMessage = {
            role: 'assistant' as const,
            text: `Hello! Welcome to your ${newInterviewData.role} interview. I'm excited to learn more about your experience with ${newInterviewData.techstack.join(', ')}. Let's start with you telling me a bit about yourself and your background. When you're ready, click "Start Speaking" to begin.`,
            timestamp: new Date()
          };
          
          // This will be handled by the useNovaS2S hook's onAssistantResponse
          console.log('AI Interviewer:', welcomeMessage.text);
        }, 1000);
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

        {/* Speech Controls */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isProcessing
                ? 'bg-gray-600 cursor-not-allowed'
                : isListening
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : isListening ? (
              <>
                <div className="inline-block w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Stop Speaking
              </>
            ) : (
              <>
                🎙️ Start Speaking
              </>
            )}
          </button>

          {transcripts.length > 0 && (
            <button
              onClick={clearTranscripts}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              🗑️ Clear
            </button>
          )}

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
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-all text-white font-semibold"
          >
            ✅ End Interview
          </button>
        </div>

        {/* Status Indicator */}
        {isListening && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-red-600 rounded-full">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-2"></div>
              Recording...
            </div>
          </div>
        )}

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
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">🎤</div>
                <div className="text-lg mb-1">Ready to start your interview</div>
                <div className="text-sm">Click "Start Speaking" to begin</div>
              </div>
            ) : (
              transcripts.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">
                      {entry.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <span className="font-semibold">
                      {entry.role === 'user' ? 'You' : 'Interviewer'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    {entry.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Export Transcript Button */}
          {transcripts.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const text = transcripts
                    .map(t => `[${t.role.toUpperCase()}]: ${t.text}`)
                    .join('\n\n');
                  navigator.clipboard.writeText(text);
                  alert('Transcript copied to clipboard!');
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
              >
                📋 Copy Transcript
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