import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { getModelConfig, ModelConfig, ModelOverride } from './model-config';
import { ResponseFormatter } from './response-formatter';
import { QualityValidator } from './quality-validator';
import { bedrockClient } from '../aws-config';

export interface ModelRequest {
  modelId: string;
  prompt: string;
  context?: Record<string, any>;
  overrides?: Partial<ModelConfig>;
  responseType?: 'interview' | 'resume' | 'feedback' | 'general';
}

export interface ModelResponse {
  success: boolean;
  content: string;
  modelId: string;
  timestamp: string;
  metadata: {
    tokensUsed?: number;
    processingTime: number;
    quality: {
      score: number;
      issues: string[];
    };
  };
}

export class EnterpriseBedrockService {
  private client: BedrockRuntimeClient;
  private formatter: ResponseFormatter;
  private validator: QualityValidator;

  constructor() {
    this.client = bedrockClient;
    this.formatter = new ResponseFormatter();
    this.validator = new QualityValidator();
  }

  async invokeModel(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();
    const config = getModelConfig(request.modelId);
    const finalConfig = { ...config, ...request.overrides };

    try {
      const payload = this.buildPayload(request.prompt, finalConfig);
      const command = new InvokeModelCommand({
        modelId: request.modelId,
        body: JSON.stringify(payload),
        contentType: "application/json"
      });

      const response = await this.client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      const content = this.extractContent(result);
      const formattedResponse = this.formatter.format(content, request.responseType || 'general');
      const quality = this.validator.validate(formattedResponse, request.responseType);

      return {
        success: true,
        content: formattedResponse,
        modelId: request.modelId,
        timestamp: new Date().toISOString(),
        metadata: {
          tokensUsed: result.usage?.totalTokens,
          processingTime: Date.now() - startTime,
          quality
        }
      };
    } catch (error) {
      return {
        success: false,
        content: `Model invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        modelId: request.modelId,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          quality: { score: 0, issues: ['Model invocation failed'] }
        }
      };
    }
  }

  async generateInterviewResponse(userMessage: string, context: any): Promise<ModelResponse> {
    const prompt = `Role: ${context.role} | Level: ${context.level}
User: "${userMessage}"

Provide a brief follow-up question or feedback (max 50 words).`;

    return this.invokeModel({
      modelId: process.env.INTERVIEW_DEFAULT_MODEL!,
      prompt,
      context,
      responseType: 'interview',
      overrides: { maxTokens: 150 } // Fast, concise responses
    });
  }

  async analyzeResume(resumeText: string, category?: string): Promise<ModelResponse> {
    const prompt = `${getModelConfig(process.env.RESUME_ANALYSIS_MODEL!).systemPrompt}

Resume Text:
${resumeText}

Category: ${category || 'General Technology'}

Provide analysis in JSON format:
{
  "overallScore": number (1-10),
  "atsCompatibility": number (1-10),
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "missingKeywords": ["keyword1", "keyword2"],
  "industryMatch": number (0-100)
}`;

    return this.invokeModel({
      modelId: process.env.RESUME_ANALYSIS_MODEL!,
      prompt,
      responseType: 'resume',
      overrides: { responseFormat: 'json' }
    });
  }

  async provideFeedback(transcript: string, interviewData: any): Promise<ModelResponse> {
    const prompt = `${getModelConfig(process.env.FEEDBACK_MODEL!).systemPrompt}

Interview Details:
- Role: ${interviewData.role}
- Level: ${interviewData.level}
- Duration: ${interviewData.duration || 'N/A'}

Transcript:
${transcript}

Provide structured feedback:
1. Overall Performance Score (1-10)
2. Technical Skills Assessment
3. Communication Evaluation
4. Specific Areas for Improvement
5. Recommended Next Steps`;

    return this.invokeModel({
      modelId: process.env.FEEDBACK_MODEL!,
      prompt,
      context: interviewData,
      responseType: 'feedback'
    });
  }

  async generateQuestions(role: string, level: string, techStack: string[]): Promise<ModelResponse> {
    const prompt = `Generate 5 interview questions for:
- Role: ${role}
- Level: ${level}
- Tech Stack: ${techStack.join(', ')}

Include 3 technical and 2 behavioral questions. Format as numbered list.`;

    return this.invokeModel({
      modelId: process.env.FAST_MODEL!,
      prompt,
      responseType: 'general'
    });
  }

  private buildPayload(prompt: string, config: ModelConfig & ModelOverride) {
    // Nova models don't support system role, include system prompt in user message
    const fullPrompt = config.systemPrompt 
      ? `${config.systemPrompt}\n\n${prompt}`
      : prompt;

    const messages = [{ role: "user", content: [{ text: fullPrompt }] }];

    return {
      messages,
      inferenceConfig: {
        maxTokens: Math.min(config.maxTokens, 1000), // Limit for faster responses
        temperature: config.temperature,
        topP: config.topP,
        stopSequences: config.stopSequences
      }
    };
  }

  private extractContent(result: any): string {
    if (result.output?.message?.content?.[0]?.text) {
      return result.output.message.content[0].text;
    }
    throw new Error('Invalid response format from Bedrock');
  }
}

export const enterpriseBedrockService = new EnterpriseBedrockService();