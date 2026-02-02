// 🎯 Optimized Prompt Templates for AWS Bedrock Models

export const BEDROCK_PROMPTS = {
  // 📋 Resume Analysis Prompts
  RESUME_ANALYSIS: {
    COMPREHENSIVE: `
You are an expert resume analyst and career coach. Analyze the following resume with precision and provide actionable insights.

RESUME CONTENT:
{resumeText}

ANALYSIS REQUIREMENTS:
1. **Overall Assessment**: Score 1-10 with specific reasoning
2. **ATS Compatibility**: Technical formatting and keyword optimization score
3. **Experience Level Classification**: entry/mid/senior/lead based on content depth
4. **Category Recommendations**: Match to specific interview categories with confidence scores
5. **Skill Extraction**: Categorize technical, soft, and tool skills
6. **Industry Alignment**: Primary industry match with percentage confidence

OUTPUT FORMAT (JSON):
{
  "overallScore": number,
  "atsCompatibility": number,
  "experienceLevel": "entry|mid|senior|lead",
  "recommendedCategories": [
    {
      "categoryId": "string",
      "matchScore": number,
      "reasoning": "specific evidence from resume",
      "confidence": "high|medium|low"
    }
  ],
  "strengths": ["specific strengths with evidence"],
  "improvements": ["actionable improvement suggestions"],
  "missingKeywords": ["industry-relevant keywords to add"],
  "industryMatch": {
    "primary": "industry name",
    "percentage": number
  },
  "skillsExtracted": {
    "technical": ["programming languages, frameworks, tools"],
    "soft": ["leadership, communication, problem-solving"],
    "tools": ["software, platforms, methodologies"]
  }
}

Be specific, evidence-based, and actionable in all assessments.
`,

    CATEGORY_MATCHING: `
Based on this resume content, recommend the most suitable interview categories:

RESUME: {resumeText}

AVAILABLE CATEGORIES: {categories}

For each recommendation, provide:
- Match percentage (0-100)
- Specific evidence from resume
- Confidence level (high/medium/low)
- Key skills that align

Focus on the top 5 most relevant categories with detailed reasoning.
`
  },

  // 🎤 Interview Simulation Prompts
  INTERVIEW_SIMULATION: {
    CONTEXTUAL_QUESTIONS: `
Generate {questionCount} progressive interview questions for a {category} position at {level} level.

{resumeContext ? `CANDIDATE BACKGROUND:\n${resumeContext}\n` : ''}

REQUIREMENTS:
- Mix behavioral (40%) and technical (60%) questions
- Progressive difficulty from warm-up to challenging
- Role-specific scenarios and examples
- Include follow-up probes for each question
- Specify expected response elements

JSON FORMAT:
{
  "questions": [
    {
      "id": number,
      "type": "behavioral|technical|situational",
      "question": "main question text",
      "followUps": ["probe deeper", "clarify specifics", "explore alternatives"],
      "expectedElements": ["STAR method", "technical accuracy", "specific metrics"],
      "difficulty": "easy|medium|hard",
      "timeAllocation": "2-3 minutes"
    }
  ]
}

Ensure questions are:
1. Relevant to the specific role and level
2. Designed to assess key competencies
3. Open-ended to encourage detailed responses
4. Professional and unbiased
`,

    INTERVIEWER_RESPONSE: `
You are conducting a {role} interview at {level} level. The candidate just responded to your question.

INTERVIEW CONTEXT:
- Role: {role}
- Level: {level}
- Focus Areas: {techStack}
- Current Question: {currentQuestion}
- Interview Phase: {phase}

CANDIDATE RESPONSE: "{userMessage}"

RESPOND AS INTERVIEWER:
1. **Acknowledge** their response briefly (1-2 sentences)
2. **Follow-up** with a relevant probe OR transition to next topic
3. **Maintain** professional, encouraging tone
4. **Keep** response under 150 words
5. **Show** active listening and engagement

RESPONSE GUIDELINES:
- If response is incomplete: Ask for clarification or more details
- If response is strong: Acknowledge and probe deeper or move forward
- If response shows gaps: Gently guide toward better structure
- If off-topic: Redirect professionally

Be conversational, supportive, and maintain interview flow.
`,

    STREAMING_RESPONSE: `
Continue this interview conversation naturally. You are an experienced {role} interviewer.

CONTEXT: {interviewContext}
CANDIDATE SAID: "{userMessage}"

Respond with appropriate follow-up or next question. Keep it conversational and under 100 words.
`
  },

  // 📊 Performance Evaluation Prompts
  PERFORMANCE_EVALUATION: {
    COMPREHENSIVE: `
Conduct a thorough interview performance analysis:

INTERVIEW DETAILS:
- Role: {role}
- Level: {level}
- Duration: {duration} minutes
- Questions Covered: {questionCount}

FULL TRANSCRIPT:
{transcript}

EVALUATION FRAMEWORK:
Assess each area on 1-10 scale with specific evidence:

1. **Technical Knowledge**: Accuracy, depth, current practices
2. **Communication**: Clarity, structure, listening skills
3. **Problem Solving**: Approach, creativity, logical thinking
4. **Cultural Fit**: Collaboration, values alignment, adaptability
5. **Leadership**: Initiative, influence, mentoring (if applicable)

JSON OUTPUT:
{
  "overallScore": number,
  "categoryScores": {
    "technicalKnowledge": number,
    "communication": number,
    "problemSolving": number,
    "culturalFit": number,
    "leadership": number
  },
  "strengths": [
    {
      "area": "specific competency",
      "description": "what they did well",
      "examples": ["specific evidence from transcript"]
    }
  ],
  "improvements": [
    {
      "area": "competency needing work",
      "issue": "specific problem identified",
      "suggestion": "actionable improvement advice",
      "priority": "high|medium|low"
    }
  ],
  "detailedFeedback": {
    "responseQuality": "assessment of answer structure and depth",
    "communicationStyle": "clarity, pace, engagement evaluation",
    "technicalDepth": "accuracy and sophistication of technical responses",
    "behavioralResponses": "use of examples, STAR method, storytelling"
  },
  "nextSteps": [
    {
      "action": "specific recommendation",
      "timeline": "when to implement",
      "resources": ["books, courses, practice areas"]
    }
  ],
  "interviewReadiness": {
    "currentLevel": "assessment of current capability",
    "targetLevel": "where they should aim",
    "gapAnalysis": "specific areas to bridge"
  }
}

Be constructive, specific, and actionable. Provide evidence for all assessments.
`,

    QUICK_FEEDBACK: `
Provide immediate feedback on this interview response:

QUESTION: {question}
RESPONSE: {response}
ROLE: {role}
LEVEL: {level}

Give brief feedback on:
1. Response quality (1-10)
2. Key strengths
3. Main improvement area
4. Specific suggestion

Keep feedback encouraging and actionable (under 200 words).
`
  },

  // 🎯 Voice Practice Prompts
  VOICE_PRACTICE: {
    SCENARIO_GENERATION: `
Create {count} voice practice scenarios for {category} interviews at {difficulty} level.

Each scenario should include:
1. **Situation**: Realistic workplace context
2. **Task**: Specific challenge or objective
3. **Expected Response**: What interviewer wants to hear
4. **Time Limit**: Recommended response duration
5. **Evaluation Criteria**: Key elements to assess

Make scenarios:
- Relevant to {category} role
- Appropriate for {difficulty} level
- Designed for voice practice
- Realistic and engaging

JSON FORMAT:
{
  "scenarios": [
    {
      "id": number,
      "title": "scenario name",
      "situation": "context description",
      "task": "what candidate needs to address",
      "expectedResponse": "key elements of good response",
      "timeLimit": "2-3 minutes",
      "evaluationCriteria": ["clarity", "structure", "technical accuracy"],
      "difficulty": "easy|medium|hard"
    }
  ]
}
`
  },

  // 🔧 Utility Prompts
  UTILITIES: {
    SKILL_EXTRACTION: `
Extract and categorize skills from this text:

TEXT: {text}

Categorize into:
- Technical: Programming languages, frameworks, tools
- Soft: Communication, leadership, problem-solving
- Domain: Industry-specific knowledge
- Certifications: Professional credentials

Return as JSON with confidence scores.
`,

    KEYWORD_OPTIMIZATION: `
Suggest ATS-friendly keywords for this {role} resume:

CURRENT CONTENT: {resumeText}
TARGET ROLE: {role}
EXPERIENCE LEVEL: {level}

Provide:
1. Missing high-impact keywords
2. Keyword density recommendations
3. Industry-specific terms
4. Action verbs to include

Focus on keywords that improve ATS parsing and recruiter appeal.
`
  }
};

// 🎯 Model-Specific Configurations
export const MODEL_CONFIGS = {
  'anthropic.claude-3-5-sonnet-20241022-v2:0': {
    name: 'Claude 3.5 Sonnet',
    bestFor: ['interview simulation', 'complex analysis', 'conversational AI'],
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    stopSequences: ['Human:', 'Assistant:']
  },
  
  'amazon.nova-pro-v1:0': {
    name: 'Nova Pro',
    bestFor: ['resume analysis', 'performance evaluation', 'structured output'],
    maxTokens: 2048,
    temperature: 0.5,
    topP: 0.8,
    stopSequences: []
  },
  
  'anthropic.claude-3-haiku-20240307-v1:0': {
    name: 'Claude 3 Haiku',
    bestFor: ['quick responses', 'real-time chat', 'simple tasks'],
    maxTokens: 1024,
    temperature: 0.8,
    topP: 0.9,
    stopSequences: []
  },
  
  'amazon.titan-embed-text-v2:0': {
    name: 'Titan Embeddings',
    bestFor: ['semantic search', 'similarity matching', 'category recommendations'],
    maxInputLength: 8000,
    outputDimensions: 1024
  }
};

// 🎯 Prompt Template Engine
export class PromptTemplateEngine {
  static format(template: string, variables: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  static getPrompt(category: string, type: string, variables: Record<string, any> = {}): string {
    const template = BEDROCK_PROMPTS[category as keyof typeof BEDROCK_PROMPTS]?.[type as keyof any];
    
    if (!template) {
      throw new Error(`Prompt template not found: ${category}.${type}`);
    }

    return this.format(template, variables);
  }

  static getModelConfig(modelId: string) {
    return MODEL_CONFIGS[modelId as keyof typeof MODEL_CONFIGS] || {
      name: 'Unknown Model',
      bestFor: ['general tasks'],
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      stopSequences: []
    };
  }
}

// 🎯 Usage Examples
export const PROMPT_EXAMPLES = {
  resumeAnalysis: () => PromptTemplateEngine.getPrompt('RESUME_ANALYSIS', 'COMPREHENSIVE', {
    resumeText: 'Software Engineer with 5 years experience in React, Node.js...'
  }),
  
  interviewQuestion: () => PromptTemplateEngine.getPrompt('INTERVIEW_SIMULATION', 'CONTEXTUAL_QUESTIONS', {
    category: 'Frontend Developer',
    level: 'senior',
    questionCount: 5,
    resumeContext: 'Candidate has React and TypeScript experience'
  }),
  
  performanceEval: () => PromptTemplateEngine.getPrompt('PERFORMANCE_EVALUATION', 'COMPREHENSIVE', {
    role: 'Software Engineer',
    level: 'mid',
    duration: 45,
    questionCount: 8,
    transcript: 'Q: Tell me about yourself... A: I am a software engineer...'
  })
};

export default BEDROCK_PROMPTS;