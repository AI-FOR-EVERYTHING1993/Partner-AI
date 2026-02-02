'use client';

import { useState } from 'react';
import { useAIInterviewFlow } from '@/hooks/useAIInterviewFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function AIInterviewDemo() {
  const [resumeText, setResumeText] = useState('');
  const [userInput, setUserInput] = useState('');
  
  const {
    loading,
    error,
    resumeAnalysis,
    interviewSections,
    selectedSections,
    interviewStarted,
    conversation,
    finalFeedback,
    analyzeResume,
    generateSections,
    startInterview,
    continueInterview,
    getFinalFeedback,
    resetFlow,
    setSelectedSections
  } = useAIInterviewFlow();

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    try {
      const analysis = await analyzeResume(resumeText);
      await generateSections(analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleStartInterview = async () => {
    if (selectedSections.length === 0) return;
    try {
      await startInterview(selectedSections);
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    try {
      await continueInterview(userInput);
      setUserInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleEndInterview = async () => {
    try {
      await getFinalFeedback();
    } catch (err) {
      console.error('Failed to get feedback:', err);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">AI Interview Prep</h1>
        <p className="text-gray-600">Complete AI-powered interview preparation flow</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* STEP 1: Resume Upload & Analysis */}
      {!resumeAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload & Analyze Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
            />
            <Button 
              onClick={handleAnalyzeResume}
              disabled={loading || !resumeText.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Resume Analysis Results */}
      {resumeAnalysis && !interviewStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Resume Analysis & Section Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">ATS Score: {resumeAnalysis.atsScore}/100</p>
                <p className="font-semibold">Overall Score: {resumeAnalysis.overallScore}/100</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recommended Roles:</p>
                <div className="flex flex-wrap gap-1">
                  {resumeAnalysis.recommendedRoles.map((role, idx) => (
                    <Badge key={idx} variant="secondary">{role}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Select Interview Sections:</h4>
              <div className="space-y-2">
                {interviewSections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={section.id}
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                    />
                    <label htmlFor={section.id} className="flex-1">
                      <span className="font-medium">{section.title}</span>
                      <span className="text-sm text-gray-600 ml-2">({section.difficulty})</span>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleStartInterview}
              disabled={loading || selectedSections.length === 0}
            >
              Start Interview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Interview Conversation */}
      {interviewStarted && !finalFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: AI Interview with Sarah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto border rounded p-4 space-y-4">
              {conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Textarea
                placeholder="Type your response..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !userInput.trim()}
                >
                  Send
                </Button>
                <Button 
                  onClick={handleEndInterview}
                  variant="outline"
                  disabled={loading}
                >
                  End Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Final Feedback */}
      {finalFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold">Overall Score: {finalFeedback.overallScore}/10</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Strengths:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {finalFeedback.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-orange-600 mb-2">Areas to Improve:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {finalFeedback.areasToImprove.map((area, idx) => (
                    <li key={idx} className="text-sm">{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sarah's Message:</h4>
              <p className="text-sm italic">{finalFeedback.encouragingMessage}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="list-decimal list-inside space-y-1">
                {finalFeedback.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-sm">{step}</li>
                ))}
              </ul>
            </div>

            <Button onClick={resetFlow} className="w-full">
              Start New Interview Prep
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center">
          <p className="text-gray-600">Processing...</p>
        </div>
      )}
    </div>
  );
}