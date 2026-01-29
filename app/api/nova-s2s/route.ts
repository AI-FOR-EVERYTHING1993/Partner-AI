// app/api/nova-s2s/route.ts
import { 
  BedrockRuntimeClient, 
  InvokeModelCommand 
} from '@aws-sdk/client-bedrock-runtime';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { audio, context, conversationHistory } = await request.json();

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS credentials not configured, using mock response');
      return NextResponse.json(getMockResponse(context));
    }

    // Build the interview prompt
    const systemPrompt = buildInterviewPrompt(context);
    
    // Build conversation history
    const messages = buildMessages(conversationHistory);

    // Nova Sonic S2S request payload
    const payload = {
      schemaVersion: "1.0",
      inferenceConfig: {
        maxTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
      system: [{ text: systemPrompt }],
      messages: [
        ...messages,
        {
          role: "user",
          content: [
            {
              audio: {
                data: audio,
                mediaType: "audio/webm",
              }
            }
          ]
        }
      ],
      outputModalities: ["text", "audio"],
      audioOutputConfig: {
        codec: "mp3",
        voiceId: "matthew",
        sampleRate: 24000,
      }
    };

    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-sonic-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Parse Nova's response
    const result = parseNovaResponse(responseBody);

    return NextResponse.json({
      userTranscript: result.userTranscript,
      assistantText: result.assistantText,
      audioBase64: result.audioBase64,
      audioUrl: null,
    });

  } catch (error: any) {
    console.error('Nova S2S Error:', error);
    
    if (error.name === 'AccessDeniedException') {
      return NextResponse.json(
        { error: 'AWS access denied. Check your credentials and Bedrock permissions.' },
        { status: 403 }
      );
    }
    
    if (error.name === 'ResourceNotFoundException') {
      return NextResponse.json(
        { error: 'Nova Sonic model not found. Ensure it is enabled in your AWS Bedrock console.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process audio' },
      { status: 500 }
    );
  }
}

function buildInterviewPrompt(context: any): string {
  if (!context) {
    return `You are a professional interviewer conducting a job interview. 
Be conversational, ask follow-up questions, and provide brief feedback.
Keep responses to 2-3 sentences.`;
  }

  return `You are a professional interviewer conducting a ${context.level} level interview for a ${context.role} position.

Focus areas: ${context.techstack?.join(', ')}

Guidelines:
- Ask relevant ${context.type === 'technical' ? 'technical' : 'behavioral'} questions
- Be conversational and natural
- Provide brief, constructive feedback when appropriate
- Keep responses concise (2-3 sentences)
- Ask follow-up questions based on candidate's answers
- Be encouraging but professional

If this is the beginning of the interview, introduce yourself briefly and ask your first question.`;
}

function buildMessages(history: any[]): any[] {
  if (!history || history.length === 0) return [];

  return history.map(entry => ({
    role: entry.role === 'user' ? 'user' : 'assistant',
    content: [{ text: entry.text }]
  }));
}

function parseNovaResponse(response: any): {
  userTranscript: string;
  assistantText: string;
  audioBase64: string;
} {
  let userTranscript = '';
  let assistantText = '';
  let audioBase64 = '';

  if (response.output?.message?.content) {
    for (const content of response.output.message.content) {
      if (content.text) {
        assistantText = content.text;
      }
      if (content.audio?.data) {
        audioBase64 = content.audio.data;
      }
    }
  }

  if (response.inputTranscription) {
    userTranscript = response.inputTranscription;
  }

  return { userTranscript, assistantText, audioBase64 };
}

function getMockResponse(context: any) {
  const questions = [
    `Tell me about your experience with ${context?.techstack?.[0] || 'your primary technology'}.`,
    `Can you describe a challenging project you've worked on?`,
    `How do you handle tight deadlines and pressure?`,
    `What interests you most about this ${context?.role || 'role'}?`,
    `Where do you see yourself in 5 years?`,
  ];
  
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    userTranscript: "[Mock] Your speech would be transcribed here",
    assistantText: `[Mock Response] ${randomQuestion}`,
    audioBase64: null,
    audioUrl: null,
  };
}