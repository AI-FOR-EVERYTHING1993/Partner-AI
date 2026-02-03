// 🎯 Bedrock AI Prompts for Interview System
// Optimized for Nova models with structured responses

export const BEDROCK_PROMPTS = {
  // 📄 Resume Analysis Prompts
  RESUME_ANALYSIS: {
    COMPREHENSIVE_ANALYSIS: `Analyze this resume and provide structured JSON output with interview category recommendations:

RESUME TEXT:
{resumeText}

Provide analysis in this exact JSON format:
{
  "overallScore": <number 1-100>,
  "atsCompatibility": <number 1-100>,
  "industryMatch": <number 1-100>,
  "experienceLevel": "<entry|mid|senior|lead>",
  "detectedRole": "<primary role detected>",
  "detectedIndustry": "<primary industry>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>",
    "<strength 4>"
  ],
  "improvements": [
    "<improvement 1>",
    "<improvement 2>",
    "<improvement 3>",
    "<improvement 4>"
  ],
  "keywords": {
    "present": ["<keyword1>", "<keyword2>", "<keyword3>"],
    "missing": ["<missing1>", "<missing2>", "<missing3>"]
  },
  "recommendedInterviews": [
    {
      "category": "<interview category id>",
      "name": "<interview name>",
      "match": <percentage 1-100>,
      "reason": "<why this interview is recommended>"
    }
  ],
  "nextSteps": [
    "<actionable step 1>",
    "<actionable step 2>",
    "<actionable step 3>"
  ]
}`,

    QUICK_SCAN: `Quickly analyze this resume for key information:

{resumeText}

Return JSON with:
- experienceLevel (entry/mid/senior)
- primarySkills (array of top 5 skills)
- detectedRole (most likely job title)
- overallScore (1-100)
- topStrength (single biggest strength)`
  },

  // 🎤 Interview Simulation Prompts
  INTERVIEW_SIMULATION: {
    CONTEXTUAL_QUESTIONS: `Generate interview questions for a {category} position at {level} level.

REQUIREMENTS:
- Mix behavioral (40%) and technical (60%) questions
- Progressive difficulty from warm-up to challenging
- Role-specific scenarios and examples
- Include follow-up probes for each question

JSON FORMAT:
{
  "questions": [
    {
      "id": 1,
      "type": "behavioral",
      "question": "main question text",
      "followUps": ["probe deeper", "clarify specifics"],
      "expectedElements": ["STAR method", "specific metrics"],
      "difficulty": "easy",
      "timeAllocation": "2-3 minutes"
    }
  ]
}`,

    INTERVIEWER_RESPONSE: `You are conducting a {role} interview at {level} level. The candidate just responded to your question.

INTERVIEW CONTEXT:
- Role: {role}
- Level: {level}
- Focus Areas: {techStack}
- Current Question: {currentQuestion}

CANDIDATE RESPONSE:
"{candidateResponse}"

Provide a natural interviewer response that:
1. Acknowledges their answer appropriately
2. Asks a relevant follow-up question
3. Keeps the conversation flowing naturally
4. Maintains professional interview tone

Keep response under 100 words and conversational.`,

    STREAMING_RESPONSE: `As an interviewer for {role} position, respond to: "{userInput}"

Keep it conversational, under 50 words, and ask a follow-up question.`
  },

  // 📊 Performance Analysis Prompts
  PERFORMANCE_ANALYSIS: {
    COMPREHENSIVE_FEEDBACK: `Analyze this interview performance and provide comprehensive feedback:

INTERVIEW CONTEXT:
- Role: {role}
- Level: {level}
- Duration: {duration}
- Questions Asked: {questionCount}

INTERVIEW TRANSCRIPT:
{transcript}

RESUME ANALYSIS (if available):
{resumeAnalysis}

Provide detailed feedback in JSON format:
{
  "overallScore": <number 1-100>,
  "performance": {
    "technical": <score 1-100>,
    "communication": <score 1-100>,
    "problemSolving": <score 1-100>,
    "confidence": <score 1-100>
  },
  "strengths": [
    "<strength 1 with specific example>",
    "<strength 2 with specific example>",
    "<strength 3 with specific example>"
  ],
  "improvements": [
    "<improvement 1 with actionable advice>",
    "<improvement 2 with actionable advice>",
    "<improvement 3 with actionable advice>"
  ],
  "resumeAlignment": {
    "score": <how well interview matched resume 1-100>,
    "gaps": ["<gap 1>", "<gap 2>"],
    "highlights": ["<highlight 1>", "<highlight 2>"]
  },
  "nextSteps": [
    "<specific action 1>",
    "<specific action 2>",
    "<specific action 3>"
  ]
}`,

    QUICK_FEEDBACK: `Provide brief feedback for this interview response:

Question: "{question}"
Answer: "{answer}"
Role: {role}

Give a score (1-10) and 2-3 sentence feedback focusing on:
- Content quality
- Communication clarity
- Technical accuracy (if applicable)

Format: Score: X/10. Brief feedback here.`
  },

  // 🎯 Question Generation Prompts
  QUESTION_GENERATION: {
    ROLE_SPECIFIC: `Generate 5 interview questions for {role} at {level} level.

Focus on:
- Core competencies for this role
- {level}-appropriate complexity
- Mix of technical and behavioral
- Industry best practices

Return as numbered list with brief rationale for each.`,

    FOLLOW_UP_QUESTIONS: `Based on this interview exchange, generate 3 natural follow-up questions:

Original Question: "{originalQuestion}"
Candidate Answer: "{candidateAnswer}"
Role: {role}

Follow-ups should:
- Dig deeper into their response
- Clarify technical details
- Explore real-world application
- Maintain interview flow`,

    KEYWORD_OPTIMIZATION: `Generate interview questions that assess these specific skills:

Skills to assess: {skills}
Role: {role}
Level: {level}

Create questions that naturally evaluate these skills without being too obvious.
Include both direct technical questions and scenario-based questions.`
  }
};

// 🔧 Utility Functions for Prompt Building
export const buildPrompt = (template: string, variables: Record<string, any>): string => {
  let prompt = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const replacement = Array.isArray(value) ? value.join(', ') : String(value || '');
    prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
  });
  
  return prompt;
};

export const getPrompt = (category: string, type: string): string => {
  const categories = category.split('.');
  let current: any = BEDROCK_PROMPTS;
  
  for (const cat of categories) {
    current = current[cat];
    if (!current) return '';
  }
  
  return current[type] || '';
};