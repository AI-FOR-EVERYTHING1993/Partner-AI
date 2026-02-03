import { NextRequest, NextResponse } from 'next/server';
import { enterpriseModelService } from '@/lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const { action, transcript, interviewContext, userId, sessionId } = await request.json();

    switch (action) {
      case 'start':
        // Fast greeting with minimal tokens
        const greeting = await enterpriseModelService.conductInterview(
          `Start interview for ${interviewContext.role} (${interviewContext.level}). Brief greeting + first question.`,
          interviewContext,
          userId
        );

        return NextResponse.json({
          success: true,
          response: greeting.content,
          sessionId: sessionId || `s_${Date.now()}`,
          action: 'greeting',
          meta: { 
            model: greeting.modelId,
            time: greeting.metadata.processingTime,
            quality: greeting.metadata.quality.score 
          }
        });

      case 'process_speech':
        if (!transcript?.trim()) {
          return NextResponse.json({ error: 'Transcript required' }, { status: 400 });
        }

        // Optimized prompt for speed
        const response = await enterpriseModelService.conductInterview(
          `User: "${transcript}". Brief follow-up for ${interviewContext.role} interview.`,
          { ...interviewContext, prev: transcript },
          userId
        );

        return NextResponse.json({
          success: true,
          response: response.content,
          transcript,
          action: 'follow_up',
          meta: {
            model: response.modelId,
            time: response.metadata.processingTime,
            quality: response.metadata.quality.score
          }
        });

      case 'analyze_performance':
        const { fullTranscript, interviewData } = await request.json();
        
        const analysis = await enterpriseModelService.provideFeedback(
          fullTranscript,
          interviewData,
          userId
        );

        return NextResponse.json({
          success: true,
          analysis: analysis.content,
          action: 'final_feedback',
          meta: {
            model: analysis.modelId,
            time: analysis.metadata.processingTime,
            quality: analysis.metadata.quality.score
          }
        });

      case 'end':
        return NextResponse.json({
          success: true,
          message: 'Session ended',
          action: 'ended'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Voice S2S error:', error);
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error.message 
    }, { status: 500 });
  }
}