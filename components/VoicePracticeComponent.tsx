"use client"

import React, { useState, useEffect } from 'react';
import { useSimpleNova } from '@/hooks/useSimpleNova';

const VoicePracticeComponent = ({ category = 'technical', difficulty = 'intermediate' }) => {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    connectionState,
    transcripts,
    isConnected,
    isListening,
    connect,
    disconnect,
    startListening,
    stopListening,
    clearTranscripts,
  } = useSimpleNova({
    interviewContext: {
      role: 'Voice Practice',
      level: difficulty,
      techstack: [category],
      type: 'voice-practice'
    }
  });

  useEffect(() => {
    loadScenarios();
  }, [category, difficulty]);

  const loadScenarios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bedrock/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'voice-practice',
          category, 
          difficulty 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        const parsedScenarios = parseScenarios(result.prompts);
        setScenarios(parsedScenarios);
        setCurrentScenario(parsedScenarios[0]);
      }
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseScenarios = (promptText) => {
    // Parse AI response into structured scenarios
    const scenarios = promptText.split(/\d+\./).filter(s => s.trim());
    return scenarios.map((scenario, index) => ({
      id: index + 1,
      title: `Scenario ${index + 1}`,
      description: scenario.trim(),
      completed: false
    }));
  };

  const handlePracticeComplete = async () => {
    if (transcripts.length === 0) return;

    setIsLoading(true);
    try {
      const userResponse = transcripts.map(t => t.text).join(' ');
      
      const response = await fetch('/api/bedrock/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'feedback',
          transcript: `Scenario: ${currentScenario.description}\n\nUser Response: ${userResponse}`,
          interviewData: { category, difficulty }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setFeedback(result.feedback);
        setCurrentScenario(prev => ({ ...prev, completed: true }));
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextScenario = () => {
    const currentIndex = scenarios.findIndex(s => s.id === currentScenario.id);
    if (currentIndex < scenarios.length - 1) {
      setCurrentScenario(scenarios[currentIndex + 1]);
      setFeedback('');
      clearTranscripts();
    }
  };

  return (
    <div className="voice-practice-component p-6 max-w-4xl mx-auto bg-gray-900 text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Voice Interview Practice</h2>
        <p className="text-gray-400">Category: {category} | Difficulty: {difficulty}</p>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="text-blue-400">Loading scenarios...</div>
        </div>
      )}

      {currentScenario && (
        <div className="scenario-section mb-6">
          <div className="bg-gray-800 p-6 rounded-lg mb-4">
            <h3 className="text-xl font-semibold mb-3">{currentScenario.title}</h3>
            <p className="text-gray-300 mb-4">{currentScenario.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm ${
                connectionState === 'connected' ? 'bg-green-900 text-green-300' :
                connectionState === 'listening' ? 'bg-red-900 text-red-300' :
                connectionState === 'processing' ? 'bg-blue-900 text-blue-300' :
                'bg-gray-700 text-gray-300'
              }`}>
                {connectionState === 'connected' && '🟢 Ready'}
                {connectionState === 'listening' && '🔴 Recording...'}
                {connectionState === 'processing' && '🔵 Processing...'}
                {connectionState === 'disconnected' && '⚪ Disconnected'}
              </div>
            </div>

            <div className="flex gap-3">
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  🎙️ Start Practice
                </button>
              ) : (
                <>
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`px-6 py-3 rounded-lg font-semibold ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isListening ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                  </button>

                  <button
                    onClick={handlePracticeComplete}
                    disabled={transcripts.length === 0 || isLoading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-semibold"
                  >
                    ✅ Get Feedback
                  </button>

                  <button
                    onClick={disconnect}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                  >
                    ✖️ End
                  </button>
                </>
              )}
            </div>
          </div>

          {transcripts.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Your Response:</h4>
              <div className="text-gray-300">
                {transcripts.map(t => t.text).join(' ')}
              </div>
            </div>
          )}

          {feedback && (
            <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2 text-blue-300">AI Feedback:</h4>
              <div className="text-gray-200 whitespace-pre-wrap">{feedback}</div>
              
              {currentScenario.completed && (
                <button
                  onClick={nextScenario}
                  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  Next Scenario →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="scenarios-progress">
        <h4 className="font-semibold mb-3">Progress ({scenarios.filter(s => s.completed).length}/{scenarios.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => setCurrentScenario(scenario)}
              className={`p-3 rounded-lg cursor-pointer border ${
                scenario.id === currentScenario?.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : scenario.completed
                  ? 'border-green-500 bg-green-900/30'
                  : 'border-gray-600 bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{scenario.title}</span>
                {scenario.completed && <span className="text-green-400">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoicePracticeComponent;