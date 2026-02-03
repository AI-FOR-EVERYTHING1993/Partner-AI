import { NextRequest, NextResponse } from 'next/server';
import { enterpriseModelService } from '@/lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const { role, level, techStack, userId } = await request.json();

    if (!role || !level || !techStack) {
      return NextResponse.json({ 
        error: 'Role, level, and techStack are required' 
      }, { status: 400 });
    }

    const response = await enterpriseModelService.generateQuestions(role, level, techStack, userId);

    if (!response.success) {
      return NextResponse.json({ 
        error: 'Failed to generate questions',
        details: response.content 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      questions: response.content,
      metadata: {
        model: response.modelId,
        qualityScore: response.metadata.quality.score,
        processingTime: response.metadata.processingTime,
        cached: response.cached
      }
    });

  } catch (error: any) {
    console.error('Enterprise questions error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error.message 
    }, { status: 500 });
  }
}