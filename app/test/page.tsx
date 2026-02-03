'use client';

import { useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Ready');

  const testResumeAnalysis = async () => {
    setStatus('Testing resume analysis...');
    try {
      const response = await fetch('/api/enterprise/health');
      if (response.ok) {
        setStatus('✅ Backend services working');
      } else {
        setStatus('❌ Backend services failed');
      }
    } catch (error) {
      setStatus('❌ Connection failed');
    }
  };

  const testAudioServices = async () => {
    setStatus('Testing audio permissions...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setStatus('✅ Audio permissions granted');
    } catch (error) {
      setStatus('❌ Audio permissions denied');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">App Health Check</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <p className="font-semibold">Status: {status}</p>
          </div>
          
          <button
            onClick={testResumeAnalysis}
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Backend Services
          </button>
          
          <button
            onClick={testAudioServices}
            className="w-full p-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Audio Permissions
          </button>
          
          <a
            href="/select-interview"
            className="block w-full p-3 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
          >
            Go to Main App
          </a>
        </div>
      </div>
    </div>
  );
}