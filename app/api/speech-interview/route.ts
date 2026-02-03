import { NextRequest, NextResponse } from 'next/server';
import { enterpriseModelService } from '@/lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const { transcript, context, userId } = await request.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const response = await enterpriseModelService.conductInterview(
      transcript,
      context,
      userId
    );

    if (!response.success) {
      return NextResponse.json({ 
        error: 'Failed to process interview response',
        details: response.content 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      response: response.content,
      metadata: {
        model: response.modelId,
        processingTime: response.metadata.processingTime,
        qualityScore: response.metadata.quality.score,
        cached: response.cached
      }
    });

  } catch (error: any) {
    console.error('Speech interview error:', error);
    return NextResponse.json({ 
      error: 'Failed to process speech interview',
      details: error.message 
    }, { status: 500 });
  }
}