import { NextRequest } from 'next/server';
import { enterpriseModelService } from '@/lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const { message, context, action, userId } = await request.json();
    
    let response;
    switch (action) {
      case 'start':
        response = await startInterview(context, userId);
        break;
      case 'respond':
        response = await processResponse(message, context, userId);
        break;
      case 'analyze':
        response = await analyzeConversation(context.transcript, context, userId);
        break;
      default:
        response = await processResponse(message, context, userId);
    }
    
    return Response.json({
      success: response.success,
      response: response.content,
      metadata: {
        model: response.modelId,
        quality: response.metadata.quality.score,
        cached: response.cached
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Enterprise Voice AI Error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: "I'm having technical difficulties. Let's continue with the interview."
    }, { status: 500 });
  }
}

async function startInterview(context: any, userId?: string) {
  const prompt = `You are Sarah, a friendly AI interviewer who ALWAYS speaks first. Start a ${context.category} interview for a ${context.level} level position.

Context:
- Role: ${context.category}
- Level: ${context.level}
- Company: ${context.company || 'the company'}
- Skills: ${context.skills || 'General'}

IMPORTANT: You must immediately introduce yourself warmly and ask the first question. Do not wait for the user to speak. Start with: "Hello! Welcome to your ${context.category} interview. I'm Sarah, your AI interviewer today, and I'm excited to learn more about your background and experience."

Then ask an engaging opening question. Keep it conversational and under 80 words total.`;

  return await enterpriseModelService.invoke({
    modelId: process.env.INTERVIEW_DEFAULT_MODEL!,
    prompt,
    context: { ...context, mode: 'voice', aiFirst: true },
    responseType: 'interview',
    userId
  });
}

async function processResponse(userMessage: string, context: any, userId?: string) {
  const prompt = `You are Sarah, conducting a ${context.category} interview. 

Previous conversation:
${context.transcript || 'Just started'}

User just said: "${userMessage}"

Respond as Sarah would:
- Ask relevant follow-up questions
- Provide encouragement
- Keep it natural and conversational
- Stay focused on ${context.category} skills
- Under 80 words`;

  return await enterpriseModelService.invoke({
    modelId: process.env.INTERVIEW_DEFAULT_MODEL!,
    prompt,
    context: { ...context, mode: 'voice', userMessage },
    responseType: 'interview',
    userId
  });
}

async function analyzeConversation(transcript: string, context: any, userId?: string) {
  const prompt = `Analyze this interview conversation and provide feedback:

${transcript}

Return JSON with:
{
  "overallScore": number (1-10),
  "technicalScore": number (1-10),
  "communicationScore": number (1-10),
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "feedback": "encouraging summary"
}`;

  return await enterpriseModelService.invoke({
    modelId: process.env.FEEDBACK_MODEL!,
    prompt,
    context: { ...context, transcript },
    responseType: 'feedback',
    overrides: { responseFormat: 'json' },
    userId
  });
}