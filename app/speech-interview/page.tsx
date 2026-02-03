'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AudioControls from '@/components/AudioControls';

export default function SpeechInterviewPage() {
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<any>(null);
  const [conversation, setConversation] = useState<Array<{
    type: 'user' | 'ai';
    text: string;
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('interviewData');
    if (!data) {
      router.push('/select-interview');
      return;
    }
    
    const parsed = JSON.parse(data);
    setInterviewData(parsed);
    setIsLoading(false);
    
    // Add initial AI greeting
    setConversation([{
      type: 'ai',
      text: `Hello! I'm ready to conduct your ${parsed.role} interview. Let's start with a simple question: Can you tell me about yourself and your experience with ${parsed.techstack?.[0] || 'technology'}?`,
      timestamp: new Date()
    }]);
  }, [router]);

  const handleTranscript = (text: string, isFinal: boolean) => {
    if (isFinal && text.trim()) {
      setConversation(prev => [...prev, {
        type: 'user',
        text: text,
        timestamp: new Date()
      }]);
    }
  };

  const handleResponse = (text: string) => {
    setConversation(prev => [...prev, {
      type: 'ai',
      text: text,
      timestamp: new Date()
    }]);
  };

  const endInterview = () => {
    const transcript = conversation
      .map(msg => `${msg.type.toUpperCase()}: ${msg.text}`)
      .join('\n\n');
    
    localStorage.setItem('interviewTranscript', transcript);
    router.push('/feedback');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Voice Interview</h1>
              <p className="text-gray-600">
                {interviewData?.role} • {interviewData?.level} • 
                {interviewData?.techstack?.join(', ') || 'General'}
              </p>
            </div>
            <button
              onClick={endInterview}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              End Interview
            </button>
          </div>

          <AudioControls
            context={interviewData}
            onTranscript={handleTranscript}
            onResponse={handleResponse}
            className="mb-6"
          />
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Conversation</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}