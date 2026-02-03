export interface QualityMetrics {
  score: number;
  issues: string[];
}

export type ResponseType = 'interview' | 'resume' | 'feedback' | 'general';

export class QualityValidator {
  validate(content: string, type?: ResponseType): QualityMetrics {
    const issues: string[] = [];
    let score = 100;

    // Basic quality checks
    if (!content || content.trim().length === 0) {
      issues.push('Empty response');
      return { score: 0, issues };
    }

    // Length validation
    if (content.length < 10) {
      issues.push('Response too short');
      score -= 30;
    }

    if (content.length > 5000) {
      issues.push('Response too long');
      score -= 20;
    }

    // Content quality checks
    if (this.hasRepeatedContent(content)) {
      issues.push('Contains repeated content');
      score -= 25;
    }

    if (this.hasPlaceholders(content)) {
      issues.push('Contains placeholder text');
      score -= 40;
    }

    if (this.hasIncompleteResponse(content)) {
      issues.push('Response appears incomplete');
      score -= 35;
    }

    // Type-specific validation
    if (type) {
      const typeScore = this.validateByType(content, type);
      score = Math.min(score, typeScore.score);
      issues.push(...typeScore.issues);
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  private validateByType(content: string, type: ResponseType): QualityMetrics {
    switch (type) {
      case 'interview':
        return this.validateInterviewResponse(content);
      case 'resume':
        return this.validateResumeResponse(content);
      case 'feedback':
        return this.validateFeedbackResponse(content);
      default:
        return { score: 100, issues: [] };
    }
  }

  private validateInterviewResponse(content: string): QualityMetrics {
    const issues: string[] = [];
    let score = 100;

    // Should be conversational
    if (!content.includes('?') && !this.hasConversationalTone(content)) {
      issues.push('Lacks conversational tone');
      score -= 20;
    }

    // Should be appropriate length for interview
    if (content.length > 300) {
      issues.push('Interview response too verbose');
      score -= 15;
    }

    // Should not be too technical without context
    if (this.hasExcessiveTechnicalJargon(content)) {
      issues.push('May be too technical');
      score -= 10;
    }

    return { score, issues };
  }

  private validateResumeResponse(content: string): QualityMetrics {
    const issues: string[] = [];
    let score = 100;

    // Check for required sections
    const requiredSections = ['score', 'strengths', 'improvements'];
    const missingSection = requiredSections.find(section => 
      !content.toLowerCase().includes(section)
    );

    if (missingSection) {
      issues.push(`Missing ${missingSection} section`);
      score -= 30;
    }

    // Should have actionable feedback
    if (!this.hasActionableContent(content)) {
      issues.push('Lacks actionable recommendations');
      score -= 25;
    }

    return { score, issues };
  }

  private validateFeedbackResponse(content: string): QualityMetrics {
    const issues: string[] = [];
    let score = 100;

    // Should have performance assessment
    if (!content.toLowerCase().includes('performance') && !content.includes('score')) {
      issues.push('Missing performance assessment');
      score -= 25;
    }

    // Should have improvement suggestions
    if (!content.toLowerCase().includes('improve') && !content.toLowerCase().includes('recommendation')) {
      issues.push('Missing improvement suggestions');
      score -= 30;
    }

    // Should be constructive
    if (this.hasNegativeTone(content)) {
      issues.push('Tone may be too negative');
      score -= 15;
    }

    return { score, issues };
  }

  private hasRepeatedContent(content: string): boolean {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    return uniqueSentences.size < sentences.length * 0.8;
  }

  private hasPlaceholders(content: string): boolean {
    const placeholders = [
      '[placeholder]', '[insert]', '[add]', '[fill]', 
      'lorem ipsum', 'todo', 'tbd', 'xxx'
    ];
    return placeholders.some(placeholder => 
      content.toLowerCase().includes(placeholder)
    );
  }

  private hasIncompleteResponse(content: string): boolean {
    const incompleteIndicators = [
      'incomplete', 'unfinished', 'to be continued',
      'more details needed', 'additional information required'
    ];
    return incompleteIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    ) || content.endsWith('...');
  }

  private hasConversationalTone(content: string): boolean {
    const conversationalWords = [
      'you', 'your', 'let\'s', 'how', 'what', 'why',
      'great', 'good', 'interesting', 'tell me'
    ];
    return conversationalWords.some(word => 
      content.toLowerCase().includes(word)
    );
  }

  private hasExcessiveTechnicalJargon(content: string): boolean {
    const technicalTerms = content.match(/\b[A-Z]{2,}\b/g) || [];
    return technicalTerms.length > content.split(' ').length * 0.1;
  }

  private hasActionableContent(content: string): boolean {
    const actionWords = [
      'should', 'could', 'recommend', 'suggest', 'improve',
      'add', 'remove', 'update', 'consider', 'try'
    ];
    return actionWords.some(word => 
      content.toLowerCase().includes(word)
    );
  }

  private hasNegativeTone(content: string): boolean {
    const negativeWords = [
      'terrible', 'awful', 'horrible', 'worst', 'failed',
      'disaster', 'pathetic', 'useless'
    ];
    return negativeWords.some(word => 
      content.toLowerCase().includes(word)
    );
  }
}