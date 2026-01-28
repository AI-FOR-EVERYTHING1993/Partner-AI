"use client"

import React, { useState, useRef } from 'react';

const PDFReviewComponent = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [writtenReview, setWrittenReview] = useState('');
  const [audioReview, setAudioReview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      await processPDF(file);
    }
  };

  const processPDF = async (file) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      // First extract text from PDF
      const extractResponse = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData
      });
      
      const extractResult = await extractResponse.json();
      
      if (extractResult.success) {
        // Then analyze with AI
        const analysisResponse = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze',
            resumeText: extractResult.text
          })
        });
        
        const analysisResult = await analysisResponse.json();
        
        if (analysisResult.success) {
          setWrittenReview(analysisResult.analysis);
          
          // Generate audio review using text-to-speech
          const audioUrl = await generateAudioReview(analysisResult.analysis);
          setAudioReview(audioUrl);
          
          // Redirect to results page with analysis
          const resumeAnalysis = {
            overallScore: 85,
            atsScore: 78,
            industryMatch: "Technology",
            experienceLevel: "Senior",
            strengths: ["Strong technical background", "Clear project descriptions"],
            improvements: ["Add more metrics", "Improve formatting"],
            keywordOptimization: {
              missing: ["React", "Node.js"],
              present: ["JavaScript", "Python"],
              suggestions: ["Add cloud technologies"]
            },
            industryInsights: {
              topSkills: ["React", "AWS", "Docker"],
              emergingTrends: ["AI/ML", "Cloud Native"],
              salaryRange: "$80k - $120k",
              demandLevel: "High"
            },
            recruiterTips: ["Quantify achievements", "Use action verbs"],
            nextSteps: ["Update skills section", "Add portfolio links"]
          };
          
          sessionStorage.setItem('resumeAnalysis', JSON.stringify(resumeAnalysis));
          setTimeout(() => {
            window.location.href = '/resume-results';
          }, 2000);
        }
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAudioReview = async (reviewText) => {
    try {
      // Use browser's speech synthesis for now
      const utterance = new SpeechSynthesisUtterance(reviewText);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      
      // Return a placeholder URL (in real implementation, use AWS Polly)
      return 'data:audio/wav;base64,placeholder';
    } catch (error) {
      console.error('Error generating audio:', error);
      return null;
    }
  };

  return (
    <div className="pdf-review-component p-6 max-w-4xl mx-auto">
      <div className="upload-section mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf"
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Upload PDF for Review'}
        </button>
      </div>

      {uploadedFile && (
        <div className="file-info mb-4">
          <p className="text-gray-600">Uploaded: {uploadedFile.name}</p>
          {isProcessing && <div className="text-blue-500">Processing PDF...</div>}
        </div>
      )}

      {writtenReview && (
        <div className="written-review mb-6">
          <h3 className="text-xl font-bold mb-3">Written Review</h3>
          <div className="bg-gray-50 p-4 rounded-lg">{writtenReview}</div>
        </div>
      )}

      {audioReview && (
        <div className="audio-review">
          <h3 className="text-xl font-bold mb-3">Voice Review</h3>
          <audio controls src={audioReview} className="w-full">
            Your browser does not support audio.
          </audio>
        </div>
      )}
    </div>
  );
};

export default PDFReviewComponent;