export type ResponseType = 'interview' | 'resume' | 'feedback' | 'general';

export interface FormattedResponse {
  content: string;
  structured?: Record<string, any>;
  metadata: {
    type: ResponseType;
    wordCount: number;
    hasStructuredData: boolean;
  };
}

export class ResponseFormatter {
  format(content: string, type: ResponseType): string {
    const cleaned = this.cleanContent(content);
    
    switch (type) {
      case 'interview':
        return this.formatInterviewResponse(cleaned);
      case 'resume':
        return this.formatResumeResponse(cleaned);
      case 'feedback':
        return this.formatFeedbackResponse(cleaned);
      default:
        return cleaned;
    }
  }

  private cleanContent(content: string): string {
    return content
      .trim()
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s*[-*]\s*/gm, '• ');
  }

  private formatInterviewResponse(content: string): string {
    // Ensure interview responses are conversational
    if (!content.includes('?') && !content.toLowerCase().includes('great') && !content.toLowerCase().includes('good')) {
      return content + '\n\nWhat are your thoughts on this?';
    }
    return content;
  }

  private formatResumeResponse(content: string): string {
    try {
      // Try to parse as JSON first
      JSON.parse(content);
      return content;
    } catch {
      // If not JSON, structure the response
      const sections = content.split(/\n(?=\d+\.|\*\*)/);
      return sections.map(section => section.trim()).join('\n\n');
    }
  }

  private formatFeedbackResponse(content: string): string {
    // Ensure feedback has clear sections
    const sections = [
      'Overall Performance',
      'Technical Skills',
      'Communication',
      'Areas for Improvement',
      'Next Steps'
    ];
    
    let formatted = content;
    sections.forEach((section, index) => {
      const regex = new RegExp(`(${section}|${index + 1}\\.)`, 'i');
      formatted = formatted.replace(regex, `\n**${section}:**`);
    });
    
    return formatted.trim();
  }

  validateStructure(content: string, expectedType: ResponseType): boolean {
    switch (expectedType) {
      case 'resume':
        try {
          const parsed = JSON.parse(content);
          return parsed.overallScore && parsed.strengths && parsed.improvements;
        } catch {
          return content.includes('Score') && content.includes('Strengths');
        }
      case 'feedback':
        return content.includes('Performance') && content.includes('Improvement');
      case 'interview':
        return content.length > 10 && content.length < 500;
      default:
        return content.length > 0;
    }
  }
}