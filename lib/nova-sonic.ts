import { BedrockRuntimeClient, InvokeModelWithBidirectionalStreamCommand } from "@aws-sdk/client-bedrock-runtime";

interface VoiceSession {
  sessionId: string;
  interviewData: any;
  conversationHistory: Array<{ role: string; content: string }>;
  startTime: Date;
  stream?: any;
}

export class NovaSonicService {
  private client: BedrockRuntimeClient;
  private activeSessions = new Map<string, VoiceSession>();
  private modelId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.modelId = process.env.NOVA_SONIC_MODEL_ID || "amazon.nova-sonic-v1:0";
  }

  async startVoiceSession(interviewData: any): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error("AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local");
    }
    
    const session: VoiceSession = {
      sessionId,
      interviewData,
      conversationHistory: [{
        role: "system",
        content: `You are an AI interviewer conducting a ${interviewData.role} interview at ${interviewData.level} level. Focus on: ${interviewData.techstack.join(', ')}. Keep responses conversational and under 50 words. Ask one question at a time.`
      }],
      startTime: new Date()
    };

    // For now, skip the complex bidirectional stream and use simple session management
    this.activeSessions.set(sessionId, session);
    return sessionId;
  }

  async processVoiceInput(sessionId: string, audioData: number[]): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    try {
      // For now, return contextual mock responses based on interview data
      const responses = [
        `Tell me about your experience in ${session.interviewData.role}.`,
        `What interests you most about ${session.interviewData.role} positions?`,
        `How do you stay updated with industry trends in ${session.interviewData.role}?`,
        `Describe a challenging project you've worked on.`,
        `What are your career goals in the next 5 years?`,
        `How do you handle working under pressure?`,
        `What makes you a good fit for this role?`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      session.conversationHistory.push({ 
        role: "user", 
        content: "[Audio input received]" 
      });
      session.conversationHistory.push({ 
        role: "assistant", 
        content: randomResponse 
      });

      return randomResponse;
    } catch (error) {
      console.error('Error processing voice input:', error);
      return "I'm sorry, I didn't catch that. Could you please repeat your answer?";
    }
  }

  async endVoiceSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      if (session.stream) {
        await session.stream.inputStream.end();
      }
      
      const sessionData = {
        sessionId,
        duration: Date.now() - session.startTime.getTime(),
        messageCount: session.conversationHistory.length,
        interviewData: session.interviewData
      };
      
      console.log("Voice session ended:", sessionData);
      this.activeSessions.delete(sessionId);
    }
  }

  private generateOrderedStream(session: VoiceSession) {
    return {
      messages: session.conversationHistory,
      audioConfig: {
        format: "pcm",
        sampleRate: 16000
      },
      inferenceConfig: {
        maxTokens: 150,
        temperature: 0.7
      }
    };
  }

  getActiveSession(sessionId: string): VoiceSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

export const novaSonicService = new NovaSonicService();