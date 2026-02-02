"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
};

const ComprehensivePDFAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState('comprehensive');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [quickAnalysis, setQuickAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Check for existing quick analysis from select-interview page
  useEffect(() => {
    const stored = sessionStorage.getItem('quickAnalysis');
    if (stored) {
      const data = JSON.parse(stored);
      setQuickAnalysis(data);
      // Clear it so it doesn't persist
      sessionStorage.removeItem('quickAnalysis');
    }
  }, []);

  const analysisTypes = [
    { id: 'comprehensive', name: 'Full Analysis', description: 'Complete resume review with ATS score and recommendations' },
    { id: 'ats', name: 'ATS Check', description: 'Focus on Applicant Tracking System compatibility' },
    { id: 'skills', name: 'Skills Gap', description: 'Identify missing skills and learning opportunities' },
    { id: 'interview', name: 'Interview Prep', description: 'Generate targeted interview questions' }
  ];

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
      setResults(null);
    }
  };

  const analyzeResume = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setProcessingStep('Extracting text from PDF...');
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('analysisType', selectedAnalysis);
      
      setProcessingStep('Analyzing with Nova Pro AI...');
      
      // Extract text from PDF first
      const text = await extractTextFromPDF(uploadedFile);
      
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text,
          category: selectedAnalysis
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResults(result);
        setProcessingStep('Analysis complete!');
      } else {
        setError(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const renderAnalysisResults = () => {
    if (!results) return null;

    const { analysis, metadata, analysisType } = results;

    switch (analysisType) {
      case 'ats':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">{analysis.atsScore}/100</div>
              <Badge variant={analysis.atsScore >= 80 ? 'default' : analysis.atsScore >= 60 ? 'secondary' : 'destructive'}>
                {analysis.compatibility}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Issues Found:</h4>
              {analysis.issues?.map((issue, idx) => (
                <div key={idx} className="mb-2 p-2 border-l-4 border-red-400 bg-red-50">
                  <div className="font-medium">{issue.description}</div>
                  <div className="text-sm text-gray-600">{issue.suggestion}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Missing Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordAnalysis?.missingKeywords?.map((keyword, idx) => (
                  <Badge key={idx} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Current Skills:</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600">Technical</h5>
                  {analysis.currentSkills?.technical?.map((skill, idx) => (
                    <Badge key={idx} className="mr-1 mb-1">{skill}</Badge>
                  ))}
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-600">Soft Skills</h5>
                  {analysis.currentSkills?.soft?.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="mr-1 mb-1">{skill}</Badge>
                  ))}
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-600">Industry</h5>
                  {analysis.currentSkills?.industry?.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1 mb-1">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Critical Skills to Learn:</h4>
              <div className="space-y-2">
                {analysis.learningPath?.filter(item => item.priority === 'high').map((item, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="font-medium">{item.skill}</div>
                    <div className="text-sm text-gray-600">Time to learn: {item.timeToLearn}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'interview':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Technical Questions:</h4>
              {analysis.questions?.technical?.map((q, idx) => (
                <div key={idx} className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium">{q.question}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <Badge variant="outline" className="mr-2">{q.difficulty}</Badge>
                    {q.category}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Behavioral Questions:</h4>
              {analysis.questions?.behavioral?.map((q, idx) => (
                <div key={idx} className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium">{q.question}</div>
                  <div className="text-sm text-gray-600 mt-1">Focus: {q.focusArea}</div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{analysis.atsScore}/100</div>
                <div className="text-sm text-gray-600">ATS Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{analysis.overallScore}/10</div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Detected Profile:</h4>
              <div className="flex space-x-2">
                <Badge>{analysis.detectedIndustry}</Badge>
                <Badge variant="secondary">{analysis.experienceLevel}</Badge>
                <Badge variant="outline">{analysis.detectedRole}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Strengths:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {analysis.strengths?.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Areas to Improve:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {analysis.weaknesses?.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Quick Analysis from Select Interview */}
      {quickAnalysis && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-800">Previous Analysis Summary</h3>
            <Badge variant="outline">From Interview Selection</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold mb-2">File: {quickAnalysis.fileName}</h4>
              <p className="text-sm text-gray-600">Uploaded: {new Date(quickAnalysis.uploadedAt).toLocaleString()}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Recommendations:</h4>
              <div className="flex space-x-2">
                <Badge>{quickAnalysis.quickSummary.suggestedCategory}</Badge>
                <Badge variant="secondary">{quickAnalysis.quickSummary.suggestedLevel}</Badge>
                <Badge variant="outline">{quickAnalysis.quickSummary.confidence}% confidence</Badge>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Upload the same or different resume below for detailed analysis</p>
            <Button 
              onClick={() => setQuickAnalysis(null)}
              variant="outline"
              size="sm"
            >
              Dismiss Summary
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">AI Resume Analyzer</h2>
        
        {/* File Upload */}
        <div className="mb-6">
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
            {uploadedFile ? 'Change PDF' : 'Upload PDF Resume'}
          </Button>
          <p className="text-sm text-gray-500 mt-2">Maximum file size: 10MB</p>
        </div>

        {/* Analysis Type Selection */}
        {uploadedFile && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Choose Analysis Type:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnalysis === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAnalysis(type.id)}
                >
                  <div className="font-medium">{type.name}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* File Info */}
        {uploadedFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium">File: {uploadedFile.name}</p>
            <p className="text-sm text-gray-600">Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <Button 
              onClick={analyzeResume}
              disabled={isProcessing}
              className="mt-3"
            >
              {isProcessing ? 'Analyzing...' : `Start ${analysisTypes.find(t => t.id === selectedAnalysis)?.name}`}
            </Button>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-700">{processingStep}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {results && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Analysis Results</h3>
            <Badge variant="outline">{results.analysisType}</Badge>
          </div>
          
          {/* Metadata */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>Pages: {results.metadata.pages}</div>
              <div>Words: {results.metadata.wordCount}</div>
              <div>Characters: {results.metadata.characterCount}</div>
              <div>Analyzed: {new Date(results.metadata.extractedAt).toLocaleTimeString()}</div>
            </div>
          </div>

          {renderAnalysisResults()}
        </Card>
      )}
    </div>
  );
};

export default ComprehensivePDFAnalyzer;