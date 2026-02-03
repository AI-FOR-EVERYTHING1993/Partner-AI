export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  stopSequences?: string[];
  timeout: number;
}

export interface ModelOverride extends Partial<ModelConfig> {
  systemPrompt?: string;
  responseFormat?: 'json' | 'text';
}

export const ENTERPRISE_MODEL_CONFIG: ModelConfig = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  stopSequences: ["\n\nHuman:", "\n\nAssistant:"],
  timeout: parseInt(process.env.AWS_REQUEST_TIMEOUT || '30000')
};

export const MODEL_OVERRIDES: Record<string, ModelOverride> = {
  // Nova Lite - Fast interview responses
  'amazon.nova-lite-v1:0': {
    temperature: 0.8,
    maxTokens: 1024,
    systemPrompt: "You are a professional AI interviewer. Be conversational, ask follow-ups, and provide constructive feedback. Keep responses under 100 words."
  },
  // Nova Pro - Detailed resume analysis
  'amazon.nova-pro-v1:0': {
    temperature: 0.3,
    maxTokens: 4000,
    responseFormat: 'json',
    systemPrompt: "You are an expert resume analyzer and career advisor. Provide structured, actionable feedback with specific scores, interview recommendations, and career guidance."
  },
  // Nova Sonic - Voice interviews and comprehensive feedback
  'amazon.nova-2-sonic-v1:0': {
    temperature: 0.6,
    maxTokens: 3000,
    systemPrompt: "You are an interview performance evaluator. Provide detailed, constructive feedback combining resume analysis with interview performance. Be specific and actionable."
  },
  // Nova Micro - Quick responses
  'amazon.nova-micro-v1:0': {
    temperature: 0.7,
    maxTokens: 512,
    timeout: 10000,
    systemPrompt: "You are a quick response AI. Provide concise, accurate answers for interview questions and quick tasks."
  },
  // Legacy Claude models (fallback)
  [process.env.INTERVIEW_DEFAULT_MODEL!]: {
    temperature: 0.8,
    maxTokens: 1024,
    systemPrompt: "You are a professional AI interviewer. Be conversational, ask follow-ups, and provide constructive feedback."
  },
  [process.env.RESUME_ANALYSIS_MODEL!]: {
    temperature: 0.5,
    maxTokens: 3000,
    responseFormat: 'json',
    systemPrompt: "You are an expert resume analyzer. Provide structured, actionable feedback with specific scores and recommendations."
  },
  [process.env.FEEDBACK_MODEL!]: {
    temperature: 0.6,
    maxTokens: 2500,
    systemPrompt: "You are an interview performance evaluator. Provide detailed, constructive feedback with specific improvement areas."
  },
  [process.env.FAST_MODEL!]: {
    temperature: 0.7,
    maxTokens: 512,
    timeout: 15000,
    systemPrompt: "You are a quick response AI. Provide concise, accurate answers."
  }
};

export const SYSTEM_PROMPTS = {
  base: "You are an AI interview preparation assistant. Always be professional, constructive, and focused on helping users improve their interview skills.",
  interview: "Conduct realistic interview scenarios based on the role and level. Ask relevant follow-up questions and provide immediate feedback.",
  resume: "Analyze resumes objectively. Focus on ATS compatibility, keyword optimization, and alignment with job requirements.",
  feedback: "Provide specific, actionable feedback with concrete examples and measurable improvement suggestions.",
  voice: "You are conducting a voice interview. Keep responses natural and conversational. Ask one question at a time."
};

export function getModelConfig(modelId: string): ModelConfig & ModelOverride {
  const baseConfig = { ...ENTERPRISE_MODEL_CONFIG };
  const overrides = MODEL_OVERRIDES[modelId] || {};
  
  return {
    ...baseConfig,
    ...overrides,
    systemPrompt: overrides.systemPrompt || SYSTEM_PROMPTS.base
  };
}