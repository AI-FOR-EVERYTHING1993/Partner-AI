import { NextRequest } from 'next/server';
import { aiInterviewFlow } from '@/lib/ai-interview-flow';
import { analyzePDFContent } from '@/lib/pdfUtils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return Response.json({ success: false, error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ success: false, error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }

    // Extract and analyze PDF content
    const pdfData = await analyzePDFContent(file);
    
    // Analyze with Nova Pro
    const analysis = await aiInterviewFlow.analyzeResumeComprehensive(pdfData.text);
    
    return Response.json({
      success: true,
      text: pdfData.text,
      metadata: {
        pages: pdfData.pages,
        wordCount: pdfData.wordCount,
        characterCount: pdfData.characterCount,
        fileName: file.name,
        fileSize: file.size
      },
      analysis: JSON.parse(analysis)
    });
    
  } catch (error) {
    console.error('PDF processing error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Processing failed' 
    }, { status: 500 });
  }
}