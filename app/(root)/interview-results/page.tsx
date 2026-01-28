"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const InterviewResultsPage = () => {
  return (
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
            <div className="text-6xl font-bold text-emerald-600 mb-4">85/100</div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>Duration: 12 minutes</div>
              <div>Questions: 8</div>
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
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">Clear communication and articulation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">Good technical knowledge demonstration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">Confident responses to behavioral questions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">🎯 Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">Provide more specific examples with metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">Elaborate on leadership experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">Practice STAR method for behavioral questions</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">💬 Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              You demonstrated solid technical knowledge and communication skills. Your responses showed good understanding of the role requirements. 
              Focus on providing more quantified examples of your achievements to strengthen your responses.
            </p>
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
  );
};

export default InterviewResultsPage;