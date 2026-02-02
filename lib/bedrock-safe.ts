import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export class SafeBedrockService {
  private client: BedrockRuntimeClient;
  private isAvailable: boolean = true;
  private lastError: string | null = null;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new InvokeModelCommand({
        modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }]
        }),
        contentType: "application/json",
      });

      await this.client.send(command);
      this.isAvailable = true;
      this.lastError = null;
      return { success: true };
    } catch (error) {
      this.isAvailable = false;
      this.lastError = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: this.lastError };
    }
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    if (!this.isAvailable) {
      return this.getFallbackResponse(prompt, context);
    }

    try {
      const command = new InvokeModelCommand({
        modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 200,
          messages: [{ role: "user", content: prompt }]
        }),
        contentType: "application/json",
      });

      const response = await this.client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      return result.content[0].text;
    } catch (error) {
      console.warn("Bedrock unavailable, using fallback:", error);
      this.isAvailable = false;
      return this.getFallbackResponse(prompt, context);
    }
  }

  private getFallbackResponse(prompt: string, context?: any): string {
    // Smart fallbacks based on context
    if (context?.type === "interview") {
      return "That's an interesting point. Can you elaborate on your experience with that technology and how you've applied it in previous projects?";
    }
    
    if (context?.type === "resume") {
      return "Your resume shows good experience. Consider highlighting specific achievements with quantifiable results to make it more impactful.";
    }

    if (prompt.toLowerCase().includes("question")) {
      return "Can you walk me through your approach to solving complex technical problems?";
    }

    return "I understand. Could you provide more details about your experience?";
  }

  getStatus() {
    return {
      available: this.isAvailable,
      lastError: this.lastError,
      timestamp: new Date().toISOString()
    };
  }
}

export const safeBedrockService = new SafeBedrockService();