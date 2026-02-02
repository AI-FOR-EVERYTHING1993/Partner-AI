"use client"

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PDFReviewComponent = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only');
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

  const processPDF = async (file) => {
    setIsProcessing(true);
    setProcessingStep('Extracting text from PDF...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setProcessingStep('Analyzing resume with AI...');
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result);
        setProcessingStep('Generating audio review...');
        
        // Generate audio review
        const audioUrl = await generateAudioReview(
          result.analysis.encouragingMessage || 
          `Resume analysis complete. ATS Score: ${result.analysis.atsScore}/100`
        );
        
        // Store for results page
        sessionStorage.setItem('resumeAnalysis', JSON.stringify({
          ...result.analysis,
          metadata: result.metadata,
          audioReview: audioUrl
        }));
        
        setProcessingStep('Complete! Redirecting...');
        setTimeout(() => {
          window.location.href = '/resume-results';
        }, 2000);
      } else {
        setError(result.error || 'Failed to process PDF');
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const generateAudioReview = async (text) => {
    try {
      const response = await fetch('/api/polly/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.substring(0, 500),
          voice: 'Joanna' 
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
      }
      return null;
    } catch (error) {
      console.error('Error generating audio:', error);
      return null;
    }
  };

  return (
    <div className="pdf-review-component p-6 max-w-4xl mx-auto">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Resume Analysis</h2>
        
        <div className="upload-section mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Upload PDF Resume'}
          </Button>
          <p className="text-sm text-gray-500 mt-2">Maximum file size: 10MB</p>
        </div>

        {error && (
          <div className="error-message mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {uploadedFile && (
          <div className="file-info mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium">File: {uploadedFile.name}</p>
            <p className="text-sm text-gray-600">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        {isProcessing && (
          <div className="processing-status mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-700">{processingStep}</span>
            </div>
          </div>
        )}

        {analysis && !isProcessing && (
          <div className="analysis-preview p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">Analysis Complete!</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ATS Score:</span> {analysis.analysis.atsScore}/100
              </div>
              <div>
                <span className="font-medium">Industry:</span> {analysis.analysis.detectedIndustry}
              </div>
              <div>
                <span className="font-medium">Experience Level:</span> {analysis.analysis.experienceLevel}
              </div>
              <div>
                <span className="font-medium">Word Count:</span> {analysis.metadata?.wordCount}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PDFReviewComponent;