import { NextRequest, NextResponse } from 'next/server';
import { simpleStorageService } from '@/lib/database/simple-storage';

export async function GET(request: NextRequest) {
  try {
    // In a real app, get userId from authentication
    const userId = request.headers.get('x-user-id') || 'test-user-123';
    
    const analyses = await simpleStorageService.getUserResumeAnalyses(userId);
    
    return NextResponse.json({
      success: true,
      analyses
    });
    
  } catch (error: any) {
    console.error('Failed to fetch resume analyses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch resume analyses',
      details: error.message
    }, { status: 500 });
  }
}