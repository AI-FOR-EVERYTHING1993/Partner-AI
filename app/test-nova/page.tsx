'use client';

import { useState } from 'react';

export default function NovaTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testResumeAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: 'Software Engineer with 3 years experience in React, Node.js, and AWS. Built 5 web applications.',
          category: 'software engineering'
        })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testInterviewQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Frontend Developer',
          level: 'Senior',
          techStack: ['React', 'TypeScript', 'Next.js']
        })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testVoiceSynthesis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/voice-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Welcome to your AI interview preparation session.',
          voiceId: 'Joanna'
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        setResult('✅ Voice synthesis successful! Audio playing...');
      } else {
        const error = await response.json();
        setResult(`Voice Error: ${JSON.stringify(error, null, 2)}`);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🚀 Nova Models Test Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={testResumeAnalysis}
          disabled={loading}
          className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '⏳' : '📄'} Resume Analysis
        </button>
        
        <button
          onClick={testInterviewQuestions}
          disabled={loading}
          className="bg-green-500 text-white p-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '⏳' : '❓'} Interview Questions
        </button>
        
        <button
          onClick={testVoiceSynthesis}
          disabled={loading}
          className="bg-orange-500 text-white p-4 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? '⏳' : '🎤'} Voice Synthesis
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Results:</h2>
        <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
          {result || 'Click a button to test Nova models...'}
        </pre>
      </div>
    </div>
  );
}