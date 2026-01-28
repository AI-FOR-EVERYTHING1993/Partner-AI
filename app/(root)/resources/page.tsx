"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-600 text-white py-16 rounded-b-3xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Interview Resources</h1>
          <p className="text-xl text-emerald-100">Everything you need to ace your next interview</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Study Materials */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Study Materials</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 text-2xl">📚</span>
                </div>
                <CardTitle className="text-emerald-600">Technical Interview Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Comprehensive guide covering algorithms, data structures, and system design.</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">Download PDF</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 text-2xl">💬</span>
                </div>
                <CardTitle className="text-emerald-600">Behavioral Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Master the STAR method with 50+ common behavioral interview questions.</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">View Questions</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 text-2xl">🏗️</span>
                </div>
                <CardTitle className="text-emerald-600">System Design Basics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Learn to design scalable systems with real-world examples and patterns.</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">Start Learning</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Practice Tools */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Practice Tools</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <CardTitle className="text-2xl text-emerald-700">AI Mock Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">Practice with our AI interviewer for personalized feedback and realistic scenarios.</p>
                <Link href="/select-interview">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full text-lg py-3">
                    Start Interview Practice
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl">📄</span>
                </div>
                <CardTitle className="text-2xl text-gray-700">Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">Get AI-powered feedback on your resume with improvement suggestions.</p>
                <Button variant="outline" className="border-gray-300 text-gray-700 w-full text-lg py-3">
                  Analyze Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Tips */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Tips</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-emerald-600 mb-4">Before the Interview</h3>
                <ul className="space-y-2">
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Research the company and role thoroughly</li>
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Practice your elevator pitch</li>
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Prepare specific examples using STAR method</li>
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Test your tech setup for virtual interviews</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-emerald-600 mb-4">During the Interview</h3>
                <ul className="space-y-2">
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Listen carefully and ask clarifying questions</li>
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Think out loud during technical problems</li>
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Show enthusiasm and genuine interest</li>
                  <li className="flex items-start text-gray-900"><span className="text-gray-900 font-bold mr-2">•</span>Ask thoughtful questions about the role</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 text-white py-16 rounded-t-3xl">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Practicing?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Put these resources to use with our AI-powered interview practice
          </p>
          <Link href="/select-interview">
            <Button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Your First Interview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;