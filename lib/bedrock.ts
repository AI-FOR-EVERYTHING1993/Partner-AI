import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export class BedrockService {
  async generateInterviewResponse(userMessage: string, interviewContext: any) {
    const prompt = `You are an AI interviewer conducting a ${interviewContext.role} interview at ${interviewContext.level} level.
Focus on: ${interviewContext.techstack.join(', ')}

User said: "${userMessage}"

Respond as an interviewer with a follow-up question or feedback. Keep responses conversational and under 100 words.`;

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }]
      }),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  }

  async analyzeInterviewPerformance(transcript: string, interviewData: any) {
    const prompt = `Analyze this interview performance for a ${interviewData.role} position:

Transcript: "${transcript}"

Provide brief feedback on:
1. Technical knowledge
2. Communication skills  
3. Areas for improvement
4. Overall score (1-10)

Keep response under 150 words.`;

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      }),
      contentType: "application/json",
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  }
}

export const bedrockService = new BedrockService();