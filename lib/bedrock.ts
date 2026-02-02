import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { enhancedBedrockService } from "./bedrock-enhanced";
import { safeBedrockService } from "./bedrock-safe";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const CLAUDE_MODEL = process.env.CLAUDE_MODEL_ID || "us.anthropic.claude-3-5-sonnet-20241022-v2:0";
const NOVA_PRO_MODEL = process.env.NOVA_PRO_MODEL_ID || "us.amazon.nova-pro-v1:0";

export class BedrockService {
  async generateInterviewResponse(userMessage: string, interviewContext: any) {
    // Use safe service with fallbacks
    return safeBedrockService.generateResponse(
      `You are an AI interviewer conducting a ${interviewContext.role} interview at ${interviewContext.level} level.\nFocus on: ${interviewContext.techstack.join(', ')}\n\nUser said: "${userMessage}"\n\nRespond as an interviewer with a follow-up question or feedback. Keep responses conversational and under 100 words.`,
      { type: "interview", ...interviewContext }
    );
  }

  async analyzeResume(resumeText: string, category?: string) {
    // Use enhanced service for better analysis
    try {
      const enhancedAnalysis = await enhancedBedrockService.analyzeResumeWithRecommendations(resumeText);
      return enhancedAnalysis;
    } catch (error) {
      console.warn('Enhanced service failed, falling back to basic analysis:', error);
      // Fallback to basic analysis
      const prompt = `Analyze this resume for ${category || 'general'} positions:

${resumeText}

Provide:
1. **Overall Score** (1-10)
2. **ATS Compatibility** (1-10)
3. **Strengths** (3-5 points)
4. **Improvements** (3-5 actionable items)
5. **Missing Keywords** for ${category || 'tech'} roles
6. **Industry Match** percentage

Be specific and actionable.`;

      return this.invokeModel(prompt, 500, NOVA_PRO_MODEL);
    }
  }

  async generateInterviewQuestions(role: string, level: string, techStack: string[]) {
    // Use enhanced service for contextual questions
    try {
      const enhancedQuestions = await enhancedBedrockService.generateContextualQuestions(role, level, techStack);
      return enhancedQuestions;
    } catch (error) {
      console.warn('Enhanced service failed, falling back to basic generation:', error);
      // Fallback to basic generation
      const prompt = `Generate 5 interview questions for a ${role} position at ${level} level focusing on ${techStack.join(', ')}. Include behavioral and technical questions.`;
      return this.invokeModel(prompt, 400, CLAUDE_MODEL);
    }
  }

  async provideFeedback(transcript: string, interviewData: any) {
    // Use enhanced service for comprehensive evaluation
    try {
      const enhancedEvaluation = await enhancedBedrockService.evaluateInterviewPerformance(transcript, interviewData);
      return enhancedEvaluation;
    } catch (error) {
      console.warn('Enhanced service failed, falling back to basic feedback:', error);
      // Fallback to basic feedback
      const prompt = `Analyze this interview performance:

Role: ${interviewData.role}
Level: ${interviewData.level}
Transcript: ${transcript}

Provide:
1. **Score** (1-10)
2. **Technical Skills** assessment
3. **Communication** evaluation
4. **Areas to Improve**
5. **Next Steps**`;
      return this.invokeModel(prompt, 400, NOVA_PRO_MODEL);
    }
  }

  async generateVoicePrompts(category: string, difficulty: string) {
    const prompt = `Generate 3 voice practice scenarios for ${category} interviews at ${difficulty} level. Include situation, task, and expected response format.`;
    return this.invokeModel(prompt, 300, CLAUDE_MODEL);
  }

  private async invokeModel(prompt: string, maxTokens: number = 200, modelId: string = NOVA_PRO_MODEL) {
    try {
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: [{ text: prompt }]
          }],
          inferenceConfig: {
            maxTokens,
            temperature: 0.7
          }
        }),
        contentType: "application/json",
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      if (result.output && result.output.message && result.output.message.content) {
        return result.output.message.content[0].text;
      }
      
      throw new Error('Invalid response format from Bedrock');
    } catch (error) {
      console.error('Bedrock API Error:', error);
      throw new Error(`Failed to invoke Bedrock model: ${error.message || error}`);
    }
  }

  // Legacy method for backward compatibility
  async analyzeInterviewPerformance(transcript: string, interviewData: any) {
    return this.provideFeedback(transcript, interviewData);
  }
}

export const bedrockService = new BedrockService();