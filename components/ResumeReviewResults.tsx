"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ResumeReviewProps {
  resumeAnalysis: {
    overallScore: number;
    atsScore: number;
    industryMatch: string;
    experienceLevel: string;
    strengths: string[];
    improvements: string[];
    keywordOptimization: {
      missing: string[];
      present: string[];
      suggestions: string[];
    };
    industryInsights: {
      topSkills: string[];
      emergingTrends: string[];
      salaryRange: string;
      demandLevel: string;
    };
    recruiterTips: string[];
    nextSteps: string[];
  };
}

const ResumeReviewResults = ({ resumeAnalysis }: ResumeReviewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Analysis Complete</h1>
          <p className="text-xl text-gray-600">AI-powered insights from top recruiters and industry experts</p>
        </div>

        {/* Overall Scores */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getScoreColor(resumeAnalysis.overallScore)} mb-2`}>
                {resumeAnalysis.overallScore}/100
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${resumeAnalysis.overallScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Based on industry standards</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">ATS Compatibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getScoreColor(resumeAnalysis.atsScore)} mb-2`}>
                {resumeAnalysis.atsScore}/100
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${resumeAnalysis.atsScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Applicant Tracking System</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">Industry Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 mb-2">
                {resumeAnalysis.industryMatch}
              </div>
              <Badge variant="secondary" className="mb-2">
                {resumeAnalysis.experienceLevel} Level
              </Badge>
              <p className="text-sm text-gray-600">Best fit industry</p>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-600 flex items-center gap-2">
                ✅ Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {resumeAnalysis.strengths.map((strength, index) => (
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
              <CardTitle className="text-orange-600 flex items-center gap-2">
                🎯 Priority Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {resumeAnalysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Keyword Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">🔍 Keyword Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Missing High-Impact Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {resumeAnalysis.keywordOptimization.missing.map((keyword, index) => (
                  <Badge key={index} variant="destructive">{keyword}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Present Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {resumeAnalysis.keywordOptimization.present.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">{keyword}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Suggestions:</h4>
              <ul className="space-y-2">
                {resumeAnalysis.keywordOptimization.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500">→</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Industry Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">📊 Industry Insights & Market Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Top Skills in Demand:</h4>
              <div className="space-y-2">
                {resumeAnalysis.industryInsights.topSkills.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{skill}</span>
                    <Badge variant="outline">High Demand</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Overview:</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary Range:</span>
                  <span className="font-semibold text-emerald-600">{resumeAnalysis.industryInsights.salaryRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Demand:</span>
                  <Badge className="bg-emerald-100 text-emerald-800">{resumeAnalysis.industryInsights.demandLevel}</Badge>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Emerging Trends:</h5>
                <ul className="space-y-1">
                  {resumeAnalysis.industryInsights.emergingTrends.map((trend, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-purple-500">▲</span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recruiter Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-indigo-600">💡 Expert Recruiter Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {resumeAnalysis.recruiterTips.map((tip, index) => (
                <div key={index} className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-600">🚀 Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumeAnalysis.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/select-interview">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold">
              Start Interview Practice
            </Button>
          </Link>
          <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold">
            Improve Resume Further
          </Button>
          <Button variant="outline" className="px-8 py-4 text-lg font-semibold">
            Schedule Expert Review Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeReviewResults;