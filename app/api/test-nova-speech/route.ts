import { NextRequest } from 'next/server';
import { novaSonicService } from '@/lib/nova-sonic';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing Nova Speech-to-Speech functionality...');
    
    // Test interview data
    const testInterviewData = {
      role: "Frontend Developer",
      level: "Senior",
      techstack: ["React", "TypeScript", "Node.js"],
      company: "Test Company"
    };

    // Start a test session
    const sessionId = await novaSonicService.startVoiceSession(testInterviewData);
    console.log(`Test session created: ${sessionId}`);
    
    // Get the initial greeting
    const initialGreeting = novaSonicService.getInitialGreeting(sessionId);
    console.log(`Initial greeting: ${initialGreeting}`);
    
    // Test processing voice input (simulated)
    const testAudioData = new Array(1600).fill(0); // Simulated 100ms of silence
    const aiResponse = await novaSonicService.processVoiceInput(sessionId, testAudioData);
    console.log(`AI Response: ${aiResponse}`);
    
    // End the test session
    await novaSonicService.endVoiceSession(sessionId);
    console.log('Test session ended successfully');
    
    return Response.json({
      success: true,
      message: "Nova Speech-to-Speech is working!",
      testResults: {
        sessionId,
        initialGreeting,
        aiResponse,
        status: "All systems operational"
      }
    });
    
  } catch (error) {
    console.error('Nova Speech-to-Speech test failed:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: "Nova Speech-to-Speech test failed"
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: "Nova Speech-to-Speech Test Endpoint",
    instructions: "Send a POST request to test the Nova speech functionality"
  });
}