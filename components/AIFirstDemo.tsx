"use client"

import React, { useState, useEffect } from 'react';

interface AIFirstDemoProps {
  interviewData: {
    role: string;
    level: string;
    techstack: string[];
  };
}

const AIFirstDemo = ({ interviewData }: AIFirstDemoProps) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate AI speaking first when component mounts
  useEffect(() => {
    startAIFirstConversation();
  }, []);

  const startAIFirstConversation = async () => {
    setIsLoading(true);
    try {
      // Call the Bedrock API to get the opening message
      const response = await fetch('/api/bedrock/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          interviewData
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([data.response]);
      }
    } catch (error) {
      console.error('Error starting AI conversation:', error);
      // Fallback message
      const fallbackMessage = `Hello! I'm excited to interview you for the ${interviewData.role} position today. Let's start with an easy one - could you tell me a bit about yourself and what drew you to ${interviewData.role}?`;
      setMessages([fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateUserResponse = () => {
    const userResponse = "Thank you! I'm passionate about technology and have been working in this field for several years...";
    setMessages(prev => [...prev, `You: ${userResponse}`]);
    
    // Simulate AI follow-up
    setTimeout(() => {
      const followUp = `That's great to hear! Can you tell me about a specific project where you used ${interviewData.techstack[0] || 'your technical skills'}? What challenges did you face?`;
      setMessages(prev => [...prev, followUp]);
    }, 1500);
  };

  return (
    <div className="ai-first-demo p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI-First Interview Demo</h2>
      <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">AI is preparing to speak...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  message.startsWith('You:') 
                    ? 'bg-blue-100 ml-8' 
                    : 'bg-green-100 mr-8'
                }`}
              >
                <strong>
                  {message.startsWith('You:') ? 'You' : 'AI Interviewer'}:
                </strong>
                <p className="mt-1">
                  {message.startsWith('You:') ? message.slice(5) : message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {messages.length > 0 && !messages[messages.length - 1].startsWith('You:') && (
        <button 
          onClick={simulateUserResponse}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Simulate User Response
        </button>
      )}
      
      <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
        <h3 className="font-semibold">How it works:</h3>
        <ul className="text-sm mt-2 space-y-1">
          <li>• AI automatically starts the conversation with a greeting</li>
          <li>• Uses interview context (role: {interviewData.role}, level: {interviewData.level})</li>
          <li>• Focuses on tech stack: {interviewData.techstack.join(', ')}</li>
          <li>• No waiting for user to speak first</li>
        </ul>
      </div>
    </div>
  );
};

export default AIFirstDemo;