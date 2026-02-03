export class MockBedrockService {
  async generateInterviewResponse(userMessage: string, context: any) {
    await new Promise(r => setTimeout(r, 500)); // Simulate API delay
    return `Great answer! Can you tell me about a time when you used ${context.techstack?.[0] || 'technology'} to solve a complex problem?`;
  }

  async analyzeResume(resumeText: string, category?: string) {
    await new Promise(r => setTimeout(r, 1000));
    return JSON.stringify({
      overallScore: 8,
      atsCompatibility: 7,
      strengths: ["Strong technical background", "Good project experience", "Clear formatting"],
      improvements: ["Add quantified achievements", "Include more keywords", "Expand on leadership experience"],
      missingKeywords: ["AWS", "Docker", "Kubernetes"],
      industryMatch: 85
    });
  }
}

export const mockBedrockService = new MockBedrockService();