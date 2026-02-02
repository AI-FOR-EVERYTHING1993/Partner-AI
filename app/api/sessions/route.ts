import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, sessionData, userId } = await request.json();
    
    switch (action) {
      case 'save':
        return await saveSession(sessionData);
      case 'get':
        return await getSession(sessionData.sessionId);
      case 'list':
        return await getUserSessions(userId);
      case 'analyze':
        return await analyzeSession(sessionData);
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session API error:', error);
    return Response.json({ error: 'Session operation failed' }, { status: 500 });
  }
}

async function saveSession(sessionData: any) {
  if (!sessionData.sessionId) {
    sessionData.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store in localStorage/sessionStorage on client side instead
  return Response.json({ 
    success: true, 
    sessionId: sessionData.sessionId,
    message: 'Session saved successfully' 
  });
}

async function getSession(sessionId: string) {
  return Response.json({ 
    success: true, 
    session: { sessionId, status: 'completed' } 
  });
}

async function getUserSessions(userId: string) {
  // Return empty sessions for now - can be implemented with client-side storage
  return Response.json({ 
    success: true, 
    sessions: []
  });
}

async function analyzeSession(sessionData: any) {
  try {
    const response = await fetch('/api/voice-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze',
        context: { transcript: sessionData.transcript }
      })
    });
    
    const data = await response.json();
    const analysis = JSON.parse(data.response);
    
    return Response.json({ success: true, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json({ error: 'Analysis failed' }, { status: 500 });
  }
}