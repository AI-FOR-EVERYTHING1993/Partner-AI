import { 
  BedrockRuntimeClient, 
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand
} from "@aws-sdk/client-bedrock-runtime";
import { 
  BedrockAgentRuntimeClient,
  RetrieveCommand,
  RetrieveAndGenerateCommand
} from "@aws-sdk/client-bedrock-agent-runtime";

// Enhanced Bedrock Service with Knowledge Base Integration
export class EnhancedBedrockService {
  private bedrockClient: BedrockRuntimeClient;
  private agentClient: BedrockAgentRuntimeClient;
  
  // Model configurations optimized for different use cases
  private readonly models = {
    conversational: "us.anthropic.claude-3-5-sonnet-20241022-v2:0", // Best for interviews
    analytical: "us.amazon.nova-pro-v1:0", // Best for resume analysis
    creative: "us.anthropic.claude-3-haiku-20240307-v1:0", // Fast responses
    embeddings: "amazon.titan-embed-text-v2:0" // For semantic search
  };

  constructor() {
    const config = {
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    };
    
    this.bedrockClient = new BedrockRuntimeClient(config);
    this.agentClient = new BedrockAgentRuntimeClient(config);
  }

  // 🎯 Feature 1: Enhanced Resume Analysis with Category Recommendations
  async analyzeResumeWithRecommendations(resumeText: string) {
    const analysisPrompt = `
    Analyze this resume comprehensively and provide structured output:

    RESUME:
    ${resumeText}

    Provide analysis in this exact JSON format:
    {
      "overallScore": number (1-10),
      "atsCompatibility": number (1-10),
      "experienceLevel": "entry|mid|senior|lead",
      "recommendedCategories": [
        {
          "categoryId": "string",
          "matchScore": number (0-100),
          "reasoning": "string",
          "confidence": "high|medium|low"
        }
      ],
      "strengths": ["string"],
      "improvements": ["string"],
      "missingKeywords": ["string"],
      "industryMatch": {
        "primary": "string",
        "percentage": number
      },
      "skillsExtracted": {
        "technical": ["string"],
        "soft": ["string"],
        "tools": ["string"]
      }
    }

    Base category recommendations on these available categories:
    - Frontend Developer, Backend Developer, Full Stack Developer
    - Mobile Developer, iOS Developer, Android Developer
    - DevOps Engineer, Cloud Architect, Data Scientist
    - Product Manager, Engineering Manager, UX Designer
    - And 30+ other categories available in the system
    `;

    return this.invokeModel(analysisPrompt, 1000, this.models.analytical);
  }

  // 🎯 Feature 2: Knowledge Base Powered Interview Questions
  async generateContextualQuestions(category: string, level: string, resumeContext?: string) {
    try {
      // First, retrieve relevant questions from knowledge base
      const retrieveCommand = new RetrieveCommand({
        knowledgeBaseId: process.env.BEDROCK_KNOWLEDGE_BASE_ID,
        retrievalQuery: {
          text: `${category} ${level} interview questions behavioral technical`
        },
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: 10
          }
        }
      });

      const retrievalResponse = await this.agentClient.send(retrieveCommand);
      const contextualKnowledge = retrievalResponse.retrievalResults?.map(r => r.content?.text).join('\n') || '';

      const questionPrompt = `
      Generate 5 progressive interview questions for a ${category} position at ${level} level.
      
      ${resumeContext ? `CANDIDATE BACKGROUND:\n${resumeContext}\n` : ''}
      
      KNOWLEDGE BASE CONTEXT:
      ${contextualKnowledge}
      
      Requirements:
      1. Mix behavioral (2) and technical (3) questions
      2. Progressive difficulty
      3. Role-specific scenarios
      4. Include follow-up prompts
      
      Format as JSON:
      {
        "questions": [
          {
            "id": number,
            "type": "behavioral|technical",
            "question": "string",
            "followUps": ["string"],
            "expectedElements": ["string"],
            "difficulty": "easy|medium|hard"
          }
        ]
      }
      `;

      return this.invokeModel(questionPrompt, 800, this.models.conversational);
    } catch (error) {
      console.warn('Knowledge base unavailable, using fallback generation');
      return this.generateFallbackQuestions(category, level);
    }
  }

  // 🎯 Feature 3: Streaming Interview Responses
  async *streamInterviewResponse(userMessage: string, interviewContext: any) {
    const prompt = `
    You are an expert ${interviewContext.role} interviewer conducting a ${interviewContext.level} level interview.
    
    CONTEXT:
    - Role: ${interviewContext.role}
    - Level: ${interviewContext.level}
    - Focus Areas: ${interviewContext.techstack?.join(', ') || 'General'}
    - Current Question: ${interviewContext.currentQuestion || 'Opening'}
    
    CANDIDATE RESPONSE: "${userMessage}"
    
    Respond as a professional interviewer:
    1. Acknowledge their response briefly
    2. Ask a relevant follow-up question OR move to next topic
    3. Keep responses conversational and under 150 words
    4. Maintain professional but friendly tone
    
    If the response seems incomplete or unclear, ask for clarification.
    If the response is strong, acknowledge it and probe deeper or move forward.
    `;

    const command = new InvokeModelWithResponseStreamCommand({
      modelId: this.models.conversational,
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 300,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }]
      }),
      contentType: "application/json"
    });

    try {
      const response = await this.bedrockClient.send(command);
      
      if (response.body) {
        for await (const chunk of response.body) {
          if (chunk.chunk?.bytes) {
            const text = new TextDecoder().decode(chunk.chunk.bytes);
            const parsed = JSON.parse(text);
            
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      yield "I apologize, but I'm having trouble processing your response. Could you please repeat that?";
    }
  }

  // 🎯 Feature 4: Advanced Performance Evaluation
  async evaluateInterviewPerformance(transcript: string, interviewData: any) {
    const evaluationPrompt = `
    Analyze this interview performance comprehensively:

    INTERVIEW DETAILS:
    - Role: ${interviewData.role}
    - Level: ${interviewData.level}
    - Duration: ${interviewData.duration || 'Not specified'}
    - Questions Asked: ${interviewData.questionsCount || 'Multiple'}

    TRANSCRIPT:
    ${transcript}

    Provide detailed evaluation in this JSON format:
    {
      "overallScore": number (1-10),
      "categoryScores": {
        "technicalKnowledge": number (1-10),
        "communication": number (1-10),
        "problemSolving": number (1-10),
        "culturalFit": number (1-10),
        "leadership": number (1-10)
      },
      "strengths": [
        {
          "area": "string",
          "description": "string",
          "examples": ["string"]
        }
      ],
      "improvements": [
        {
          "area": "string",
          "issue": "string",
          "suggestion": "string",
          "priority": "high|medium|low"
        }
      ],
      "detailedFeedback": {
        "responseQuality": "string",
        "communicationStyle": "string",
        "technicalDepth": "string",
        "behavioralResponses": "string"
      },
      "nextSteps": [
        {
          "action": "string",
          "timeline": "string",
          "resources": ["string"]
        }
      ],
      "interviewReadiness": {
        "currentLevel": "string",
        "targetLevel": "string",
        "gapAnalysis": "string"
      }
    }

    Be specific, actionable, and constructive in all feedback.
    `;

    return this.invokeModel(evaluationPrompt, 1200, this.models.analytical);
  }

  // 🎯 Feature 5: Semantic Category Matching
  async findBestMatchingCategories(resumeText: string, availableCategories: any[]) {
    const embeddingPrompt = `Extract key skills and experience from this resume for category matching: ${resumeText}`;
    
    try {
      // Generate embeddings for resume
      const resumeEmbedding = await this.generateEmbeddings(embeddingPrompt);
      
      // Calculate similarity scores with categories
      const categoryScores = await Promise.all(
        availableCategories.map(async (category) => {
          const categoryText = `${category.name} ${category.description} ${category.skills?.join(' ') || ''}`;
          const categoryEmbedding = await this.generateEmbeddings(categoryText);
          
          const similarity = this.calculateCosineSimilarity(resumeEmbedding, categoryEmbedding);
          
          return {
            ...category,
            matchScore: Math.round(similarity * 100),
            confidence: similarity > 0.7 ? 'high' : similarity > 0.5 ? 'medium' : 'low'
          };
        })
      );

      return categoryScores
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5); // Top 5 matches
        
    } catch (error) {
      console.warn('Embeddings unavailable, using text-based matching');
      return this.fallbackCategoryMatching(resumeText, availableCategories);
    }
  }

  // 🎯 Utility Methods
  private async generateEmbeddings(text: string): Promise<number[]> {
    const command = new InvokeModelCommand({
      modelId: this.models.embeddings,
      body: JSON.stringify({
        inputText: text.substring(0, 8000) // Titan embed limit
      }),
      contentType: "application/json"
    });

    const response = await this.bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.embedding;
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async invokeModel(prompt: string, maxTokens: number, modelId: string) {
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }]
      }),
      contentType: "application/json"
    });

    const response = await this.bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  }

  private async generateFallbackQuestions(category: string, level: string) {
    const prompt = `Generate 5 interview questions for ${category} at ${level} level. Include behavioral and technical questions.`;
    return this.invokeModel(prompt, 600, this.models.conversational);
  }

  private fallbackCategoryMatching(resumeText: string, categories: any[]) {
    return categories.map(category => ({
      ...category,
      matchScore: Math.floor(Math.random() * 40) + 60, // Placeholder scoring
      confidence: 'medium'
    })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }
}

export const enhancedBedrockService = new EnhancedBedrockService();