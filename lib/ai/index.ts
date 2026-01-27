import { BedrockService } from "./bedrock";

export interface AIService {
  generateInterviewQuestions(params: {
    role: string;
    level: string;
    techstack: string[];
    amount: number;
  }): Promise<string[]>;
}

class AWSBedrockService implements AIService {
  private bedrock = new BedrockService();

  async generateInterviewQuestions(params: {
    role: string;
    level: string;
    techstack: string[];
    amount: number;
  }): Promise<string[]> {
    const prompt = `Prepare questions for the job interview.
    The job role is ${params.role}. The experience level is ${params.level}.
    The tech stack is ${params.techstack.join(', ')}.
    Generate ${params.amount} questions.
    Format the output as a JSON array of strings.`;
    
    const text = await this.bedrock.generateText(prompt);
    return JSON.parse(text);
  }
}

// Use AWS Bedrock exclusively
export const aiService = new AWSBedrockService();