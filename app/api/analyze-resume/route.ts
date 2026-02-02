import { NextRequest, NextResponse } from 'next/server';
import { bedrockService } from '@/lib/bedrock';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, category } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const analysis = await bedrockService.analyzeResume(resumeText, category);

    return NextResponse.json({ 
      success: true, 
      analysis,
      model: 'amazon.nova-pro-v1:0'
    });

  } catch (error: any) {
    console.error('Resume analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze resume',
      details: error.message 
    }, { status: 500 });
  }
}