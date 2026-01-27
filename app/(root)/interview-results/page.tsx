"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

const InterviewResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get interview results from sessionStorage
    const storedResults = sessionStorage.getItem('interviewResults');
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      // Mock results for demo
      const mockResults = {
        overallScore: 78,
        duration: "12 minutes",
        questionsAnswered: 8,
        strengths: [
          "Clear communication and articulation",
          "Good technical knowledge demonstration",
          "Confident responses to behavioral questions"
        ],
        improvements: [
          "Provide more specific examples with metrics",
          "Elaborate on leadership experiences",
          "Practice STAR method for behavioral questions"
        ],
        feedback: "You demonstrated solid technical knowledge and communication skills. Focus on providing more quantified examples of your achievements to strengthen your responses."
      };
      setResults(mockResults);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Interview</h2>
            <p className="text-gray-600">Generating personalized feedback...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
            <p className="text-xl text-gray-600">Here's your personalized feedback</p>
          </div>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-6xl font-bold text-emerald-600 mb-4">{results.overallScore}/100</div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>Duration: {results.duration}</div>
                <div>Questions: {results.questionsAnswered}</div>
                <div>Score: Above Average</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-600">✅ Key Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">🎯 Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">💬 Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{results.feedback}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/select-interview">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3">
                Practice Another Interview
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-3">
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default InterviewResultsPage;