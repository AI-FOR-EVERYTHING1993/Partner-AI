interface ConversationEntry {
  timestamp: string;
  speaker: 'ai' | 'user';
  message: string;
  type?: 'greeting' | 'question' | 'answer' | 'feedback';
}

interface InterviewSession {
  sessionId: string;
  userId?: string;
  interviewData: any;
  conversation: ConversationEntry[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'abandoned';
}

export class ConversationStorage {
  private static sessions = new Map<string, InterviewSession>();

  static startSession(sessionId: string, interviewData: any, userId?: string): void {
    this.sessions.set(sessionId, {
      sessionId,
      userId,
      interviewData,
      conversation: [],
      startTime: new Date().toISOString(),
      status: 'active'
    });
  }

  static addMessage(sessionId: string, speaker: 'ai' | 'user', message: string, type?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.conversation.push({
        timestamp: new Date().toISOString(),
        speaker,
        message,
        type
      });
    }
  }

  static getSession(sessionId: string): InterviewSession | undefined {
    return this.sessions.get(sessionId);
  }

  static endSession(sessionId: string): InterviewSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = new Date().toISOString();
      session.status = 'completed';
      return session;
    }
    return null;
  }

  static getConversationHistory(sessionId: string): ConversationEntry[] {
    const session = this.sessions.get(sessionId);
    return session?.conversation || [];
  }
}

export default ConversationStorage;