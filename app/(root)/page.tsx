"use client"

import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-200 to-green-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <img src="/logo-image.jpg" alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8 mr-2" />
          <div className="text-lg sm:text-2xl font-bold text-gray-900">Partner AI</div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-bold">
            How it Works
          </Link>
          <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-bold">
            Features
          </Link>
          <Link href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors font-bold">
            Resources
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-bold">
            Pricing
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
              Get Started
            </Button>
          </Link>
        </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-32 pb-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Master Any Talk and Interview with
          <span className="text-emerald-600"> AI-Powered</span> Practice
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Get personalized feedback, practice with realistic scenarios, and build confidence 
          for technical and non-technical interviews across all industries.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/sign-up">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-lg">
              Start Practicing Free
            </Button>
          </Link>
          <Button variant="outline" className="border-gray-300 text-gray-700 px-8 py-4 text-lg font-semibold rounded-lg">
            Watch Demo
          </Button>
        </div>

        {/* Hero Demo */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">AI Interviewer</div>
                <div className="text-sm text-gray-500">Ready to begin your practice session</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-gray-700">
                "Hello! I'm your AI interviewer. I'll help you practice for your dream job with 
                personalized questions and real-time feedback. Ready to get started?"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-700 mb-2">10K+</div>
              <div className="text-emerald-800">Interviews Practiced</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-700 mb-2">95%</div>
              <div className="text-emerald-800">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-700 mb-2">50+</div>
              <div className="text-emerald-800">Industries Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-700 mb-2">24/7</div>
              <div className="text-emerald-800">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">How it Works</h2>
            <p className="text-xl text-emerald-800">Three simple steps to interview success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload & Analyze</h3>
              <p className="text-gray-600">
                Upload your resume and let our AI analyze your background to suggest 
                the perfect interview type and difficulty level.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Practice & Learn</h3>
              <p className="text-gray-600">
                Engage in realistic interview scenarios with our AI interviewer. 
                Practice both technical and behavioral questions.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Feedback</h3>
              <p className="text-gray-600">
                Receive detailed feedback on your performance and personalized 
                suggestions to improve your interview skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">Interview Resources</h2>
            <p className="text-xl text-emerald-800">Everything you need to succeed in your interviews</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-emerald-600 text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Guides</h3>
              <p className="text-gray-600">Comprehensive guides covering technical concepts, behavioral questions, and industry-specific topics</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-emerald-600 text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Questions</h3>
              <p className="text-gray-600">Curated question banks for different roles and experience levels with detailed explanations</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-emerald-600 text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Tips</h3>
              <p className="text-gray-600">Insider advice from hiring managers and industry professionals to give you the edge</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/resources">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold">
                Explore All Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section id="features" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-emerald-800">Everything you need to ace your next interview</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-emerald-100 text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-700">Smart resume analysis and personalized interview recommendations powered by AWS Bedrock</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-emerald-100 text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry-Specific</h3>
              <p className="text-gray-700">Practice for tech, finance, healthcare, consulting, and more industries with tailored questions</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-emerald-100 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Feedback</h3>
              <p className="text-gray-700">Get scored feedback and improvement suggestions with confidence metrics</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-emerald-100 text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Practice</h3>
              <p className="text-gray-700">Practice speaking with our AI interviewer using Vapi for realistic voice experience</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-emerald-100 text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-700">Monitor your improvement over time with detailed analytics and performance history</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <span className="text-emerald-100 text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Enhancement</h3>
              <p className="text-gray-700">Get AI-powered suggestions to improve your resume and stand out to employers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">Success Stories</h2>
            <p className="text-xl text-emerald-800">See how Partner AI helped others land their dream jobs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-emerald-600 font-bold">JS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">John Smith</div>
                  <div className="text-sm text-gray-500">Software Engineer at Google</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Partner AI helped me practice system design questions and gave me the confidence 
                I needed to ace my Google interview. The feedback was incredibly detailed!"
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-emerald-600 font-bold">MJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maria Johnson</div>
                  <div className="text-sm text-gray-500">Product Manager at Meta</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The behavioral interview practice was game-changing. I went from nervous 
                to confident and landed my dream PM role!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Experience Level</h2>
            <p className="text-xl text-gray-600">Tailored interview prep for every career stage</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Beginner Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🌱</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Beginner</h3>
                <p className="text-gray-600 mb-4">Perfect for early career professionals</p>
                <div className="text-sm text-blue-600 font-semibold mb-2">0-2 Years Experience</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">$2.99</div>
                <p className="text-sm text-gray-500">Unlimited access for 24 hours</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-600 mr-3">✓</span>
                  Entry-level focused questions
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-600 mr-3">✓</span>
                  Basic behavioral interviews
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-600 mr-3">✓</span>
                  Resume optimization tips
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-blue-600 mr-3">✓</span>
                  Confidence building exercises
                </li>
              </ul>
              
              <Link href="/sign-up">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Start Your Journey
                </Button>
              </Link>
            </div>

            {/* Mid-Level Plan */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl border border-emerald-200 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mid-Level</h3>
                <p className="text-gray-600 mb-4">Advance your career with confidence</p>
                <div className="text-sm text-emerald-600 font-semibold mb-2">3-6 Years Experience</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">$7.99</div>
                <p className="text-sm text-gray-500">Unlimited access for 24 hours</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-emerald-600 mr-3">✓</span>
                  Advanced technical scenarios
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-emerald-600 mr-3">✓</span>
                  Leadership & teamwork questions
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-emerald-600 mr-3">✓</span>
                  Salary negotiation strategies
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-emerald-600 mr-3">✓</span>
                  Industry-specific deep dives
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-emerald-600 mr-3">✓</span>
                  Performance review prep
                </li>
              </ul>
              
              <Link href="/sign-up">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Level Up Your Career
                </Button>
              </Link>
            </div>

            {/* Expert Plan */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-lg transition-shadow">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👑</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Expert</h3>
                <p className="text-gray-600 mb-4">Master executive-level interviews</p>
                <div className="text-sm text-purple-600 font-semibold mb-2">6+ Years Experience</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">$19</div>
                <p className="text-sm text-gray-500">Unlimited access for 24 hours</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-600 mr-3">✓</span>
                  C-suite & executive interviews
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-600 mr-3">✓</span>
                  Strategic thinking assessments
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-600 mr-3">✓</span>
                  Board presentation practice
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-600 mr-3">✓</span>
                  Crisis management scenarios
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-600 mr-3">✓</span>
                  Executive presence coaching
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-purple-600 mr-3">✓</span>
                  Priority support & feedback
                </li>
              </ul>
              
              <Link href="/sign-up">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Master Your Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-emerald-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of successful candidates who used Partner AI to land their dream jobs
          </p>
          <Link href="/sign-up">
            <Button className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Practicing Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-lg sm:text-2xl font-bold mb-4">Partner AI</div>
          <p className="text-gray-400 mb-8">Master any talk and interview with AI-powered practice</p>
          
          <div className="flex justify-center space-x-8 text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;