// Simple file-based storage for development (no AWS permissions needed)
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export interface SimpleUserProfile {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  stats: {
    totalInterviews: number;
    averageScore: number;
    lastInterviewDate?: string;
  };
}

export interface SimpleInterviewSession {
  sessionId: string;
  userId: string;
  timestamp: string;
  category: string;
  level: string;
  techStack: string[];
  status: 'active' | 'completed' | 'abandoned';
  scores?: {
    overall: number;
    technical: number;
    communication: number;
    confidence: number;
  };
  transcript?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface SimpleResumeAnalysis {
  analysisId: string;
  userId: string;
  timestamp: string;
  analysis: {
    overallScore: number;
    atsCompatibility: number;
    detectedRole: string;
    experienceLevel: string;
    recommendedInterviews: Array<{
      category: string;
      name: string;
      match: number;
      reason: string;
    }>;
    strengths: string[];
    improvements: string[];
    keywords: {
      present: string[];
      missing: string[];
    };
  };
}

class SimpleStorageService {
  private getFilePath(type: string, userId?: string): string {
    if (userId) {
      return join(DATA_DIR, `${type}_${userId}.json`);
    }
    return join(DATA_DIR, `${type}.json`);
  }

  private readData<T>(filePath: string): T[] {
    try {
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error reading data:', error);
      return [];
    }
  }

  private writeData<T>(filePath: string, data: T[]): void {
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing data:', error);
    }
  }

  // User Profile Operations
  async createUserProfile(profile: SimpleUserProfile): Promise<void> {
    const filePath = this.getFilePath('profiles');
    const profiles = this.readData<SimpleUserProfile>(filePath);
    
    const existingIndex = profiles.findIndex(p => p.userId === profile.userId);
    if (existingIndex >= 0) {
      profiles[existingIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    this.writeData(filePath, profiles);
  }

  async getUserProfile(userId: string): Promise<SimpleUserProfile | null> {
    const filePath = this.getFilePath('profiles');
    const profiles = this.readData<SimpleUserProfile>(filePath);
    return profiles.find(p => p.userId === userId) || null;
  }

  // Interview Session Operations
  async createInterviewSession(session: SimpleInterviewSession): Promise<void> {
    const filePath = this.getFilePath('sessions', session.userId);
    const sessions = this.readData<SimpleInterviewSession>(filePath);
    sessions.push(session);
    this.writeData(filePath, sessions);
  }

  async getUserInterviewSessions(userId: string): Promise<SimpleInterviewSession[]> {
    const filePath = this.getFilePath('sessions', userId);
    const sessions = this.readData<SimpleInterviewSession>(filePath);
    return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async updateInterviewSession(sessionId: string, userId: string, updates: Partial<SimpleInterviewSession>): Promise<void> {
    const filePath = this.getFilePath('sessions', userId);
    const sessions = this.readData<SimpleInterviewSession>(filePath);
    
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);
    if (sessionIndex >= 0) {
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
      this.writeData(filePath, sessions);
    }
  }

  // Resume Analysis Operations
  async createResumeAnalysis(analysis: SimpleResumeAnalysis): Promise<void> {
    const filePath = this.getFilePath('analyses', analysis.userId);
    const analyses = this.readData<SimpleResumeAnalysis>(filePath);
    analyses.push(analysis);
    this.writeData(filePath, analyses);
  }

  async getUserResumeAnalyses(userId: string): Promise<SimpleResumeAnalysis[]> {
    const filePath = this.getFilePath('analyses', userId);
    const analyses = this.readData<SimpleResumeAnalysis>(filePath);
    return analyses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Stats Operations
  async getUserStats(userId: string): Promise<{
    totalInterviews: number;
    averageScore: number;
    recentSessions: SimpleInterviewSession[];
    topCategories: Array<{ category: string; count: number }>;
  }> {
    const sessions = await this.getUserInterviewSessions(userId);
    const completedSessions = sessions.filter(s => s.status === 'completed' && s.scores);
    
    const totalInterviews = completedSessions.length;
    const averageScore = totalInterviews > 0 
      ? completedSessions.reduce((sum, s) => sum + (s.scores?.overall || 0), 0) / totalInterviews
      : 0;
    
    const recentSessions = sessions.slice(0, 5);
    
    const categoryCount = sessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalInterviews,
      averageScore,
      recentSessions,
      topCategories
    };
  }
}

export const simpleStorageService = new SimpleStorageService();