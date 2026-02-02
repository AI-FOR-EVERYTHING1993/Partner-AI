import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromIni } from '@aws-sdk/credential-providers';
import { NodeHttpHandler } from '@smithy/node-http-handler';

const httpHandler = new NodeHttpHandler({
  keepAlive: true,
  maxSockets: 50,
  requestTimeout: 30000,
  connectionTimeout: 5000
});

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: fromIni(),
  requestHandler: httpHandler,
  maxAttempts: 3,
  retryMode: 'adaptive'
});

const NOVA_LITE_MODEL = "amazon.nova-lite-v1:0";
const NOVA_PRO_MODEL = "amazon.nova-pro-v1:0";
const NOVA_SONIC_MODEL = "amazon.nova-2-sonic-v1:0";

export class BedrockService {
  async generateInterviewResponse(userMessage: string, interviewContext: any) {
    const prompt = `You are an AI interviewer conducting a ${interviewContext.role} interview at ${interviewContext.level} level.
Focus on: ${interviewContext.techstack.join(', ')}

User said: "${userMessage}"

Respond as an interviewer with a follow-up question or feedback. Keep responses conversational and under 100 words.`;
    
    return this.invokeModel(prompt, 150, NOVA_LITE_MODEL);
  }

  async analyzeResume(resumeText: string, category?: string) {
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

  async generateInterviewQuestions(role: string, level: string, techStack: string[]) {
    const prompt = `Generate 5 interview questions for a ${role} position at ${level} level focusing on ${techStack.join(', ')}. Include behavioral and technical questions.`;
    return this.invokeModel(prompt, 400, NOVA_LITE_MODEL);
  }

  async provideFeedback(transcript: string, interviewData: any) {
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
    
    return this.invokeModel(prompt, 400, NOVA_SONIC_MODEL);
  }

  private async invokeModel(prompt: string, maxTokens: number = 200, modelId: string = NOVA_LITE_MODEL) {
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
    
    if (result.output?.message?.content?.[0]?.text) {
      return result.output.message.content[0].text;
    }
    
    throw new Error('Invalid response format from Bedrock');
  }
}

export const bedrockService = new BedrockService();