"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ResumeResultsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Analysis Complete!</h1>
          <p className="text-xl text-gray-600">Here's your detailed resume review</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-emerald-600">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-600">85/100</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-blue-600">ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">78/100</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-purple-600">Industry Match</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-purple-600">Software Engineering</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-600">✅ Key Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">Strong technical skills with modern frameworks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">Quantified achievements showing business impact</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">Clear career progression</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span className="text-gray-700">ATS-friendly formatting</span>
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
                  <span className="text-gray-700">Add more leadership examples</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">Include specific project metrics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">Strengthen professional summary</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">Add industry keywords</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">🔍 Keyword Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-emerald-600 mb-2">Present Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {["JavaScript", "React", "Node.js", "AWS", "Git"].map((keyword) => (
                    <span key={keyword} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {["Agile", "Scrum", "CI/CD", "Cloud Architecture"].map((keyword) => (
                    <span key={keyword} className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">💡 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <span className="text-gray-700">Update technical skills with AI/ML technologies</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <span className="text-gray-700">Add 2-3 quantified achievements per role</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">•</span>
                <span className="text-gray-700">Create compelling professional summary</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3">
            Download Improved Resume
          </Button>
          <Link href="/select-interview">
            <Button variant="outline" className="px-8 py-3">
              Select Interview
            </Button>
          </Link>
          <Link href="/interview?category=frontend&level=mid&type=technical&company=startup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Take Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResumeResultsPage;