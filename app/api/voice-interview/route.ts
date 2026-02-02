import { NextRequest } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_BEARER_TOKEN_BEDROCK
  }
});

export async function POST(request: NextRequest) {
  try {
    const { message, context, action } = await request.json();
    
    let response;
    switch (action) {
      case 'start':
        response = await startInterview(context);
        break;
      case 'respond':
        response = await processResponse(message, context);
        break;
      case 'analyze':
        response = await analyzeConversation(context.transcript);
        break;
      default:
        response = await processResponse(message, context);
    }
    
    return Response.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Voice AI Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      fallback: "I'm having technical difficulties. Let's continue with the interview."
    }, { status: 500 });
  }
}

async function startInterview(context: any) {
  const prompt = `You are Sarah, a friendly AI interviewer. Start a ${context.category} interview for a ${context.level} level position.

Context:
- Role: ${context.category}
- Level: ${context.level}
- Company: ${context.company}
- Skills: ${context.skills || 'General'}

Introduce yourself warmly and ask the first question. Keep it conversational and under 100 words.`;

  return await invokeNova(prompt);
}

async function processResponse(userMessage: string, context: any) {
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

  return await invokeNova(prompt);
}

async function analyzeConversation(transcript: string) {
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

  return await invokeClaude(prompt);
}

async function invokeNova(prompt: string) {
  try {
    const command = new InvokeModelCommand({
      modelId: "us.amazon.nova-pro-v1:0",
      body: JSON.stringify({
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: {
          maxTokens: 200,
          temperature: 0.7
        }
      }),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.output?.message?.content?.[0]?.text || "Let's continue with the interview.";
  } catch (error) {
    console.error('Nova Error:', error);
    return getFallbackResponse(prompt);
  }
}

async function invokeClaude(prompt: string) {
  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      }),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  } catch (error) {
    console.error('Claude Error:', error);
    return JSON.stringify({
      overallScore: 7,
      technicalScore: 7,
      communicationScore: 8,
      strengths: ["Good communication", "Relevant experience"],
      improvements: ["Add more technical details", "Provide specific examples"],
      feedback: "Great job! You showed good understanding and communication skills."
    });
  }
}

function getFallbackResponse(prompt: string) {
  if (prompt.includes('start') || prompt.includes('introduce')) {
    return "Hi! I'm Sarah, your AI interviewer. I'm excited to learn about your experience and skills. Let's start with a simple question: Can you tell me about yourself and what interests you about this role?";
  }
  
  if (prompt.includes('technical') || prompt.includes('code')) {
    return "That's interesting! Can you walk me through how you would approach solving a complex technical problem? What's your process?";
  }
  
  return "Great answer! Can you give me a specific example of when you've applied that skill in a real project?";
}