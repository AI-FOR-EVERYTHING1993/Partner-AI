"use client"

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const PDFReviewComponent = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Accept both PDF and text files
      if (!file.type.includes('pdf') && !file.type.includes('text') && !file.name.endsWith('.txt')) {
        setError('Please upload a PDF or text file (.pdf, .txt)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum size is 10MB');
        return;
      }
      setError('');
      setUploadedFile(file);
      await processPDF(file);
    }
  };

  const processPDF = async (file: File) => {
    setIsProcessing(true);
    setProcessingStep('Extracting text from file...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setProcessingStep('Analyzing resume with AI (Nova Pro)...');
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success && result.analysis) {
        setProcessingStep('Analysis complete! Preparing results...');
        
        // Redirect to results page with analysis data
        const analysisParam = encodeURIComponent(JSON.stringify(result.analysis));
        router.push(`/resume-results?analysis=${analysisParam}`);
        
      } else {
        setError(result.error || 'Failed to analyze resume');
        console.error('Analysis failed:', result);
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="pdf-review-component p-6 max-w-4xl mx-auto">
      <Card className="p-8 bg-white shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-gray-600">Get AI-powered analysis with interview recommendations</p>
        </div>
        
        <div className="upload-section mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt"
            className="hidden"
          />
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg"
            >
              {isProcessing ? 'Processing...' : '📄 Choose Resume File'}
            </Button>
            
            <p className="text-sm text-gray-500 mt-4">
              Supports PDF and text files • Maximum size: 10MB
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {uploadedFile && (
          <div className="file-info mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">📎 {uploadedFile.name}</p>
                <p className="text-sm text-blue-600">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="text-blue-600">
                ✅ Ready for analysis
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="processing-status mb-4 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <div>
                <p className="text-emerald-800 font-medium">{processingStep}</p>
                <p className="text-emerald-600 text-sm">This may take 10-30 seconds...</p>
              </div>
            </div>
            
            <div className="mt-4 bg-emerald-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-600">Powered by Amazon Nova Pro</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900">ATS Scoring</h3>
            <p className="text-sm text-gray-600">Applicant tracking system compatibility</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900">Interview Prep</h3>
            <p className="text-sm text-gray-600">Personalized interview recommendations</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PDFReviewComponent;