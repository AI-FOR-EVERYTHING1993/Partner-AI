"use client"

import ComprehensivePDFAnalyzer from '@/components/ComprehensivePDFAnalyzer';
import PDFReview from '@/components/PDFReview';

export default function PDFAnalysisTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Resume Analysis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your PDF resume and get comprehensive AI analysis including ATS compatibility, 
            skills gap assessment, and personalized interview preparation.
          </p>
        </div>
        
        <PDFReview />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Upload PDF</h3>
                <p className="text-sm text-gray-600">Upload your resume in PDF format (max 10MB)</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Analysis</h3>
                <p className="text-sm text-gray-600">Select the type of analysis you want to perform</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">AI Processing</h3>
                <p className="text-sm text-gray-600">Our AI analyzes your resume using advanced models</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Get Results</h3>
                <p className="text-sm text-gray-600">Receive detailed feedback and actionable insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}