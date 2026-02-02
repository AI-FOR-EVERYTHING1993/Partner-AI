import { NextRequest, NextResponse } from 'next/server';
import { bedrockService } from '@/lib/bedrock';

export async function POST(request: NextRequest) {
  try {
    const { message, interviewContext } = await request.json();

    if (!message || !interviewContext) {
      return NextResponse.json({ 
        error: 'Message and interview context are required' 
      }, { status: 400 });
    }

    const response = await bedrockService.generateInterviewResponse(message, interviewContext);

    return NextResponse.json({ 
      success: true, 
      response,
      model: 'amazon.nova-lite-v1:0'
    });

  } catch (error: any) {
    console.error('Interview chat error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate response',
      details: error.message 
    }, { status: 500 });
  }
}