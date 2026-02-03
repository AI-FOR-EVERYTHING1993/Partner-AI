import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting resume analysis debug...');
    
    // Test 1: Check environment variables
    const envCheck = {
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      RESUME_ANALYSIS_MODEL: process.env.RESUME_ANALYSIS_MODEL,
      AUTH_BYPASS_ENABLED: process.env.AUTH_BYPASS_ENABLED
    };
    
    console.log('🔧 Environment check:', envCheck);
    
    // Test 2: Try to import enterprise service
    let serviceImportError = null;
    let enterpriseService = null;
    
    try {
      const { enterpriseModelService } = await import('@/lib/enterprise');
      enterpriseService = enterpriseModelService;
      console.log('✅ Enterprise service imported successfully');
    } catch (error: any) {
      serviceImportError = error.message;
      console.log('❌ Enterprise service import failed:', error.message);
    }
    
    // Test 3: Try to call the service with simple text
    let serviceCallResult = null;
    let serviceCallError = null;
    
    if (enterpriseService) {
      try {
        console.log('🧪 Testing service call...');
        const testResult = await enterpriseService.analyzeResume(
          'John Smith\nSoftware Engineer\n5 years JavaScript experience',
          'general'
        );
        serviceCallResult = {
          success: testResult.success,
          modelId: testResult.modelId,
          contentLength: testResult.content?.length || 0,
          contentPreview: testResult.content?.substring(0, 100) || 'No content'
        };
        console.log('✅ Service call successful');
      } catch (error: any) {
        serviceCallError = error.message;
        console.log('❌ Service call failed:', error.message);
      }
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        environment: envCheck,
        serviceImport: {
          success: !serviceImportError,
          error: serviceImportError
        },
        serviceCall: {
          success: !serviceCallError,
          result: serviceCallResult,
          error: serviceCallError
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();
    
    console.log('📄 Debug POST: Received resume text');
    console.log('Text length:', resumeText?.length || 0);
    
    if (!resumeText) {
      return NextResponse.json({ error: 'No resume text provided' }, { status: 400 });
    }
    
    // Import and test the service
    const { enterpriseModelService } = await import('@/lib/enterprise');
    
    console.log('🤖 Calling enterprise model service...');
    const result = await enterpriseModelService.analyzeResume(resumeText, 'general');
    
    console.log('📊 Service result:', {
      success: result.success,
      modelId: result.modelId,
      contentLength: result.content?.length,
      qualityScore: result.metadata?.quality?.score
    });
    
    return NextResponse.json({
      success: true,
      result: {
        success: result.success,
        modelId: result.modelId,
        content: result.content,
        metadata: result.metadata
      }
    });
    
  } catch (error: any) {
    console.error('❌ Debug POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}