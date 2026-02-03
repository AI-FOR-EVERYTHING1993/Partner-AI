import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand,
  DeleteCommand,
  ScanCommand 
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const docClient = DynamoDBDocumentClient.from(client);

// User Profile Model
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    interviewTypes: string[];
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
    techStack: string[];
  };
  stats: {
    totalInterviews: number;
    averageScore: number;
    lastInterviewDate?: string;
  };
}

// Interview Session Model
export interface InterviewSession {
  sessionId: string;
  userId: string;
  timestamp: string;
  category: string;
  level: string;
  techStack: string[];
  status: 'active' | 'completed' | 'abandoned';
  transcript: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  scores?: {
    overall: number;
    technical: number;
    communication: number;
    confidence: number;
  };
  feedback?: string;
  duration?: number;
}

// Resume Analysis Model
export interface ResumeAnalysis {
  analysisId: string;
  userId: string;
  timestamp: string;
  resumeText: string;
  analysis: {
    overallScore: number;
    atsCompatibility: number;
    industryMatch: number;
    experienceLevel: string;
    detectedRole: string;
    detectedIndustry: string;
    strengths: string[];
    improvements: string[];
    keywords: {
      present: string[];
      missing: string[];
    };
    recommendedInterviews: Array<{
      category: string;
      name: string;
      match: number;
      reason: string;
    }>;
    nextSteps: string[];
  };
  modelMetadata: {
    modelId: string;
    processingTime: number;
    qualityScore: number;
  };
}

// Interview Question Model
export interface InterviewQuestion {
  category: string;
  questionId: string;
  level: 'entry' | 'mid' | 'senior' | 'lead';
  type: 'technical' | 'behavioral' | 'system-design';
  question: string;
  expectedAnswer: string;
  followUp?: string;
  tags: string[];
  difficulty: number; // 1-10
  timeLimit?: number; // minutes
}

// Database Service Class
export class DatabaseService {
  
  // User Profile Operations
  async createUserProfile(profile: UserProfile): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: 'UserProfiles',
      Item: profile
    }));
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const result = await docClient.send(new GetCommand({
      TableName: 'UserProfiles',
      Key: { userId }
    }));
    return result.Item as UserProfile || null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ');
    
    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});
    
    const expressionAttributeValues = Object.entries(updates)
      .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {});

    await docClient.send(new UpdateCommand({
      TableName: 'UserProfiles',
      Key: { userId },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));
  }

  // Interview Session Operations
  async createInterviewSession(session: InterviewSession): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: 'InterviewSessions',
      Item: session
    }));
  }

  async getInterviewSession(sessionId: string, timestamp: string): Promise<InterviewSession | null> {
    const result = await docClient.send(new GetCommand({
      TableName: 'InterviewSessions',
      Key: { sessionId, timestamp }
    }));
    return result.Item as InterviewSession || null;
  }

  async getUserInterviewSessions(userId: string): Promise<InterviewSession[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: 'InterviewSessions',
      IndexName: 'UserIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false // Most recent first
    }));
    return result.Items as InterviewSession[] || [];
  }

  async updateInterviewSession(
    sessionId: string, 
    timestamp: string, 
    updates: Partial<InterviewSession>
  ): Promise<void> {
    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ');
    
    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});
    
    const expressionAttributeValues = Object.entries(updates)
      .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {});

    await docClient.send(new UpdateCommand({
      TableName: 'InterviewSessions',
      Key: { sessionId, timestamp },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    }));
  }

  // Resume Analysis Operations
  async createResumeAnalysis(analysis: ResumeAnalysis): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: 'ResumeAnalyses',
      Item: analysis
    }));
  }

  async getResumeAnalysis(analysisId: string): Promise<ResumeAnalysis | null> {
    const result = await docClient.send(new GetCommand({
      TableName: 'ResumeAnalyses',
      Key: { analysisId }
    }));
    return result.Item as ResumeAnalysis || null;
  }

  async getUserResumeAnalyses(userId: string): Promise<ResumeAnalysis[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: 'ResumeAnalyses',
      IndexName: 'UserIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false
    }));
    return result.Items as ResumeAnalysis[] || [];
  }

  // Interview Question Operations
  async createInterviewQuestion(question: InterviewQuestion): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: 'InterviewQuestions',
      Item: question
    }));
  }

  async getInterviewQuestions(
    category: string, 
    level?: string, 
    limit: number = 10
  ): Promise<InterviewQuestion[]> {
    const params: any = {
      TableName: 'InterviewQuestions',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: { ':category': category },
      Limit: limit
    };

    if (level) {
      params.FilterExpression = '#level = :level';
      params.ExpressionAttributeNames = { '#level': 'level' };
      params.ExpressionAttributeValues[':level'] = level;
    }

    const result = await docClient.send(new QueryCommand(params));
    return result.Items as InterviewQuestion[] || [];
  }

  async getRandomInterviewQuestions(
    category: string, 
    level: string, 
    count: number = 5
  ): Promise<InterviewQuestion[]> {
    const allQuestions = await this.getInterviewQuestions(category, level, 50);
    
    // Shuffle and take random questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Bulk Operations
  async seedInterviewQuestions(questions: InterviewQuestion[]): Promise<void> {
    const batchSize = 25; // DynamoDB batch limit
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(question => this.createInterviewQuestion(question))
      );
    }
  }

  // Analytics Operations
  async getUserStats(userId: string): Promise<{
    totalInterviews: number;
    averageScore: number;
    recentSessions: InterviewSession[];
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

export const databaseService = new DatabaseService();