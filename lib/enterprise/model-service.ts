import { EnterpriseBedrockService, ModelRequest, ModelResponse } from './bedrock-service';
import { modelMonitoring } from './monitoring';
import { getModelConfig } from './model-config';

export interface EnterpriseModelRequest extends ModelRequest {
  userId?: string;
  sessionId?: string;
  retryCount?: number;
}

export interface EnterpriseModelResponse extends ModelResponse {
  retryCount: number;
  cached: boolean;
  monitoring: {
    recorded: boolean;
    alertsTriggered: number;
  };
}

export class EnterpriseModelService {
  private bedrockService: EnterpriseBedrockService;
  private cache: Map<string, { response: ModelResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.bedrockService = new EnterpriseBedrockService();
  }

  async invoke(request: EnterpriseModelRequest): Promise<EnterpriseModelResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);
    const retryCount = request.retryCount || 0;

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        retryCount: 0,
        cached: true,
        monitoring: { recorded: false, alertsTriggered: 0 }
      };
    }

    try {
      const response = await this.bedrockService.invokeModel(request);
      
      // Cache successful responses
      if (response.success && response.metadata.quality.score >= 70) {
        this.setCache(cacheKey, response);
      }

      // Record metrics
      const processingTime = Date.now() - startTime;
      modelMonitoring.recordRequest(
        request.modelId,
        processingTime,
        response.success,
        response.metadata.quality.score,
        response.metadata.tokensUsed
      );

      const alertsBefore = modelMonitoring.getAlerts().length;
      const alertsAfter = modelMonitoring.getAlerts().length;

      return {
        ...response,
        retryCount,
        cached: false,
        monitoring: {
          recorded: true,
          alertsTriggered: alertsAfter - alertsBefore
        }
      };

    } catch (error) {
      // Retry logic
      if (retryCount < this.MAX_RETRIES) {
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.invoke({ ...request, retryCount: retryCount + 1 });
      }

      // Record failed request
      modelMonitoring.recordRequest(request.modelId, Date.now() - startTime, false, 0);

      return {
        success: false,
        content: `Service unavailable after ${this.MAX_RETRIES} retries: ${error instanceof Error ? error.message : 'Unknown error'}`,
        modelId: request.modelId,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          quality: { score: 0, issues: ['Service failure'] }
        },
        retryCount,
        cached: false,
        monitoring: { recorded: true, alertsTriggered: 0 }
      };
    }
  }

  // High-level service methods
  async conductInterview(userMessage: string, context: any, userId?: string): Promise<EnterpriseModelResponse> {
    return this.invoke({
      modelId: process.env.INTERVIEW_DEFAULT_MODEL!,
      prompt: userMessage,
      context,
      responseType: 'interview',
      userId
    });
  }

  async analyzeResume(resumeText: string, category?: string, userId?: string): Promise<EnterpriseModelResponse> {
    const enhancedPrompt = `Analyze this resume and provide structured JSON output with interview category recommendations:

RESUME TEXT:
${resumeText}

Provide analysis in this exact JSON format:
{
  "overallScore": <number 1-100>,
  "atsCompatibility": <number 1-100>,
  "industryMatch": <number 1-100>,
  "experienceLevel": "<entry|mid|senior|lead>",
  "detectedRole": "<primary role detected>",
  "detectedIndustry": "<primary industry>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>",
    "<strength 4>"
  ],
  "improvements": [
    "<improvement 1>",
    "<improvement 2>",
    "<improvement 3>",
    "<improvement 4>"
  ],
  "keywords": {
    "present": ["<keyword1>", "<keyword2>", "<keyword3>"],
    "missing": ["<missing1>", "<missing2>", "<missing3>"]
  },
  "recommendedInterviews": [
    {
      "category": "<interview category id>",
      "name": "<interview name>",
      "match": <percentage 1-100>,
      "reason": "<why this interview is recommended>"
    },
    {
      "category": "<interview category id>",
      "name": "<interview name>", 
      "match": <percentage 1-100>,
      "reason": "<why this interview is recommended>"
    },
    {
      "category": "<interview category id>",
      "name": "<interview name>",
      "match": <percentage 1-100>, 
      "reason": "<why this interview is recommended>"
    }
  ],
  "nextSteps": [
    "<actionable step 1>",
    "<actionable step 2>",
    "<actionable step 3>"
  ]
}

Base recommendations on these available interview categories:
TECHNICAL: frontend, backend, fullstack, mobile, ios, android, devops, sre, cloud-architect, data-scientist, data-engineer, ml-engineer, ai-researcher, security-engineer, devsecops, qa-engineer, blockchain, game-developer, embedded-systems, platform-engineer
NON-TECHNICAL: product-manager, project-manager, engineering-manager, cto, sales-representative, account-manager, business-development, sales-engineer, marketing-manager, growth-marketing, content-marketing, brand-manager, ux-designer, ui-designer, product-designer, graphic-designer, operations-manager, finance-manager, business-analyst, financial-analyst, hr-manager, recruiter, people-operations, talent-acquisition, customer-success, support-manager, account-executive, management-consultant, strategy-manager, startup-founder`;

    return this.invoke({
      modelId: process.env.RESUME_ANALYSIS_MODEL!,
      prompt: enhancedPrompt,
      context: { category },
      responseType: 'resume',
      userId
    });
  }

  async provideFeedback(transcript: string, interviewData: any, userId?: string): Promise<EnterpriseModelResponse> {
    const enhancedPrompt = `Analyze this interview performance and provide comprehensive feedback:

INTERVIEW CONTEXT:
- Role: ${interviewData.role}
- Level: ${interviewData.level}
- Tech Stack: ${interviewData.techstack?.join(', ') || 'N/A'}
- Duration: ${interviewData.duration || 'N/A'}

RESUME ANALYSIS (if available):
${interviewData.resumeAnalysis ? JSON.stringify(interviewData.resumeAnalysis, null, 2) : 'No resume analysis available'}

INTERVIEW TRANSCRIPT:
${transcript}

Provide detailed feedback in this JSON format:
{
  "overallScore": <number 1-100>,
  "duration": "<interview duration>",
  "questionsAnswered": <number>,
  "performance": {
    "technical": <score 1-100>,
    "communication": <score 1-100>,
    "problemSolving": <score 1-100>,
    "confidence": <score 1-100>
  },
  "strengths": [
    "<strength 1 with specific example>",
    "<strength 2 with specific example>",
    "<strength 3 with specific example>"
  ],
  "improvements": [
    "<improvement 1 with actionable advice>",
    "<improvement 2 with actionable advice>",
    "<improvement 3 with actionable advice>"
  ],
  "resumeAlignment": {
    "score": <how well interview matched resume 1-100>,
    "gaps": ["<gap 1>", "<gap 2>"],
    "highlights": ["<highlight 1>", "<highlight 2>"]
  },
  "nextSteps": [
    "<specific action 1>",
    "<specific action 2>",
    "<specific action 3>"
  ],
  "recommendedPractice": [
    "<practice area 1>",
    "<practice area 2>",
    "<practice area 3>"
  ]
}`;

    return this.invoke({
      modelId: process.env.FEEDBACK_MODEL!,
      prompt: enhancedPrompt,
      context: interviewData,
      responseType: 'feedback',
      userId
    });
  }

  async generateQuestions(role: string, level: string, techStack: string[], userId?: string): Promise<EnterpriseModelResponse> {
    return this.invoke({
      modelId: process.env.FAST_MODEL!,
      prompt: `Generate interview questions for ${role} at ${level} level`,
      context: { role, level, techStack },
      responseType: 'general',
      userId
    });
  }

  // Utility methods
  getModelHealth(): Record<string, any> {
    const metrics = modelMonitoring.getMetrics() as any[];
    const alerts = modelMonitoring.getAlerts();
    
    return {
      models: metrics.map(m => ({
        id: m.modelId,
        status: m.successRate > 0.9 ? 'healthy' : m.successRate > 0.7 ? 'degraded' : 'unhealthy',
        requests: m.requestCount,
        quality: m.averageQualityScore,
        latency: m.averageResponseTime
      })),
      alerts: alerts.length,
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString()
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  generateReport(): string {
    return modelMonitoring.generateReport();
  }

  private generateCacheKey(request: EnterpriseModelRequest): string {
    const key = `${request.modelId}:${request.prompt.substring(0, 100)}:${JSON.stringify(request.context || {})}`;
    return Buffer.from(key).toString('base64').substring(0, 64);
  }

  private getFromCache(key: string): ModelResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.response;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, response: ModelResponse): void {
    this.cache.set(key, { response, timestamp: Date.now() });
    
    // Clean old cache entries
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 200).forEach(([k]) => this.cache.delete(k));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const enterpriseModelService = new EnterpriseModelService();