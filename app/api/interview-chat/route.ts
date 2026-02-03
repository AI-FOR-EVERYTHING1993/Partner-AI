import { NextRequest, NextResponse } from 'next/server';
import { enterpriseModelService } from '@/lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const { message, interviewContext, userId } = await request.json();

    if (!message || !interviewContext) {
      return NextResponse.json({ 
        error: 'Message and interview context are required' 
      }, { status: 400 });
    }

    const response = await enterpriseModelService.conductInterview(message, interviewContext, userId);

    return NextResponse.json({ 
      success: response.success, 
      response: response.content,
      metadata: {
        model: response.modelId,
        qualityScore: response.metadata.quality.score,
        processingTime: response.metadata.processingTime,
        cached: response.cached,
        retryCount: response.retryCount,
        qualityIssues: response.metadata.quality.issues
      }
    });

  } catch (error: any) {
    console.error('Enterprise interview chat error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error.message 
    }, { status: 500 });
  }
}