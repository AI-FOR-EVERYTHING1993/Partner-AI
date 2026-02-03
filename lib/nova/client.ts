// lib/nova/client.ts

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { NovaSessionConfig, InterviewContext, TranscriptEntry } from './types';

export function createBedrockClient(region: string): BedrockRuntimeClient {
  return new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export function buildSessionConfig(context?: InterviewContext): NovaSessionConfig {
  const systemPrompt = context
    ? buildInterviewPrompt(context)
    : buildDefaultPrompt();

  return {
    region: process.env.AWS_REGION || 'us-east-1',
    modelId: process.env.NOVA_SONIC_MODEL_ID || 'us.amazon.nova-2-sonic-v1:0',
    voiceId: 'Matthew',
    sampleRate: 24000,
    systemPrompt,
    interviewContext: context,
  };
}

function buildInterviewPrompt(context: InterviewContext): string {
  const basePrompt = `You are a professional interviewer conducting a ${context.level} level interview for a ${context.role} position.

Focus areas: ${context.techstack.join(', ')}

Guidelines:
- Ask relevant ${context.type === 'technical' ? 'technical and coding' : context.type === 'behavioral' ? 'behavioral and situational' : 'mixed technical and behavioral'} questions
- Be conversational and natural
- Provide brief, constructive feedback when appropriate
- Keep responses concise (2-3 sentences maximum)
- Ask follow-up questions based on candidate's answers
- Be encouraging but professional
- Maintain interview flow and timing

Interview Structure:
1. Brief introduction and warm-up
2. Experience and background questions
3. ${context.type === 'technical' ? 'Technical deep-dive questions' : 'Behavioral scenarios'}
4. Role-specific questions
5. Candidate questions

Start by introducing yourself briefly and asking the first question.`;

  return basePrompt;
}

function buildDefaultPrompt(): string {
  return `You are a professional interviewer conducting a job interview.

Guidelines:
- Be conversational and ask follow-up questions
- Provide brief feedback when appropriate
- Keep responses to 2-3 sentences
- Be encouraging but professional
- Ask about experience, skills, and motivations

Start with a brief introduction and your first question.`;
}

export function createNovaPayload(
  config: NovaSessionConfig,
  audioBase64: string,
  conversationHistory: TranscriptEntry[]
) {
  const messages = conversationHistory.map((entry) => ({
    role: entry.role === 'user' ? 'user' : 'assistant',
    content: [{ text: entry.text }],
  }));

  return {
    schemaVersion: '1.0',
    inferenceConfig: {
      maxTokens: 512,
      temperature: 0.7,
      topP: 0.9,
    },
    system: [{ text: config.systemPrompt }],
    messages: [
      ...messages,
      {
        role: 'user',
        content: [
          {
            audio: {
              data: audioBase64,
              mediaType: 'audio/wav',
            },
          },
        ],
      },
    ],
    outputModalities: ['text', 'audio'],
    audioOutputConfig: {
      codec: 'mp3',
      voiceId: config.voiceId,
      sampleRate: config.sampleRate,
    },
  };
}

export function parseNovaResponse(response: any): {
  userTranscript: string;
  assistantText: string;
  audioBase64: string;
  confidence?: number;
} {
  let userTranscript = '';
  let assistantText = '';
  let audioBase64 = '';
  let confidence = undefined;

  if (response.output?.message?.content) {
    for (const content of response.output.message.content) {
      if (content.text) assistantText = content.text;
      if (content.audio?.data) audioBase64 = content.audio.data;
    }
  }

  if (response.inputTranscription) {
    userTranscript = response.inputTranscription;
  }

  if (response.metadata?.confidence) {
    confidence = response.metadata.confidence;
  }

  return { userTranscript, assistantText, audioBase64, confidence };
}

export function generateMockResponse(context?: InterviewContext) {
  const questions = context ? getContextualQuestions(context) : getGenericQuestions();
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    userTranscript: '[Mock] Your speech would be transcribed here',
    assistantText: `[Mock] ${randomQuestion}`,
    audioBase64: null,
    confidence: 0.95,
  };
}

function getContextualQuestions(context: InterviewContext): string[] {
  const baseQuestions = [
    `Tell me about your experience with ${context.techstack[0]}.`,
    `Describe a challenging ${context.role} project you've worked on.`,
    `How do you stay updated with ${context.techstack.join(' and ')} technologies?`,
  ];

  if (context.type === 'technical') {
    return [
      ...baseQuestions,
      `Can you walk me through how you would architect a solution using ${context.techstack[0]}?`,
      `What's the most complex technical problem you've solved recently?`,
      `How do you approach debugging in ${context.techstack[0]}?`,
    ];
  }

  if (context.type === 'behavioral') {
    return [
      ...baseQuestions,
      `Tell me about a time you had to work with a difficult team member.`,
      `Describe a situation where you had to meet a tight deadline.`,
      `How do you handle constructive criticism?`,
    ];
  }

  return baseQuestions;
}

function getGenericQuestions(): string[] {
  return [
    'Tell me about yourself and your background.',
    'What interests you most about this role?',
    'Describe a challenging project you\'ve worked on.',
    'How do you handle tight deadlines?',
    'Where do you see yourself in 5 years?',
  ];
}