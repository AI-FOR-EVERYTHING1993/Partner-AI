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
      
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWrittenReview(result.writtenReview);
        setAudioReview(result.audioUrl);
      }
      
    } catch (error) {
      console.error('Error processing PDF:', error);
    } finally {
      setIsProcessing(false);
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