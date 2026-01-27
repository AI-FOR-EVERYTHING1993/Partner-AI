import { BedrockRuntimeClient, InvokeModelWithBidirectionalStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { generateAIFirstPrompt } from "./ai-first-prompts";

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
    
    // Generate AI-first prompt
    const aiPrompt = generateAIFirstPrompt(interviewData, 'PROFESSIONAL');
    
    const session: VoiceSession = {
      sessionId,
      interviewData,
      conversationHistory: [{
        role: "system",
        content: aiPrompt.systemPrompt
      }, {
        role: "assistant",
        content: aiPrompt.openingMessage
      }],
      startTime: new Date()
    };

    this.activeSessions.set(sessionId, session);
    return sessionId;
  }

  async processVoiceInput(sessionId: string, audioData: number[]): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    try {
      // Generate contextual follow-up questions based on conversation flow
      const followUpQuestions = [
        `That's interesting! Can you walk me through a specific project where you used ${session.interviewData.techstack[0] || 'your skills'}?`,
        `Great! How do you approach problem-solving when facing technical challenges?`,
        `Tell me about a time when you had to learn a new technology quickly. How did you handle it?`,
        `What's your experience working in a team environment?`,
        `How do you stay current with industry trends and best practices?`,
        `Describe a challenging bug or issue you've encountered and how you resolved it.`,
        `What motivates you most about working in ${session.interviewData.role}?`,
        `How do you handle tight deadlines and pressure?`,
        `What are your long-term career goals?`,
        `Do you have any questions about our company or this role?`
      ];
      
      const questionIndex = Math.min(session.conversationHistory.length - 2, followUpQuestions.length - 1);
      const response = followUpQuestions[questionIndex] || "Thank you for sharing. Is there anything else you'd like to add?";
      
      session.conversationHistory.push({ 
        role: "user", 
        content: "[Audio input received]" 
      });
      session.conversationHistory.push({ 
        role: "assistant", 
        content: response 
      });

      return response;
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

  getInitialGreeting(sessionId: string): string | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    // Return the initial greeting from conversation history
    const greeting = session.conversationHistory.find(msg => msg.role === "assistant");
    return greeting?.content || null;
  }
}

export const novaSonicService = new NovaSonicService();