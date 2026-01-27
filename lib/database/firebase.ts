import { DatabaseService, InterviewData } from './types';

export class LocalStorageService implements DatabaseService {
  async saveInterview(data: InterviewData): Promise<string> {
    const id = Date.now().toString();
    const interviews = this.getStoredInterviews();
    const interviewWithId = { ...data, id };
    interviews.push(interviewWithId);
    localStorage.setItem('interviews', JSON.stringify(interviews));
    return id;
  }

  async getInterview(id: string): Promise<InterviewData | null> {
    const interviews = this.getStoredInterviews();
    return interviews.find(interview => interview.id === id) || null;
  }

  async getUserInterviews(userId: string): Promise<InterviewData[]> {
    const interviews = this.getStoredInterviews();
    return interviews
      .filter(interview => interview.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private getStoredInterviews(): InterviewData[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('interviews');
    return stored ? JSON.parse(stored) : [];
  }
}