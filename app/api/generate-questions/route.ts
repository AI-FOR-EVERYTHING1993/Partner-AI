import { NextRequest, NextResponse } from 'next/server';
import { bedrockService } from '@/lib/bedrock';

export async function POST(request: NextRequest) {
  try {
    const { role, level, techStack } = await request.json();

    if (!role || !level || !techStack) {
      return NextResponse.json({ 
        error: 'Role, level, and techStack are required' 
      }, { status: 400 });
    }

    const questions = await bedrockService.generateInterviewQuestions(role, level, techStack);

    return NextResponse.json({ 
      success: true, 
      questions,
      model: 'amazon.nova-lite-v1:0'
    });

  } catch (error: any) {
    console.error('Interview questions error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error.message 
    }, { status: 500 });
  }
}