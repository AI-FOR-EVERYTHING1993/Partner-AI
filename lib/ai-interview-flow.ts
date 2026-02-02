import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const CLAUDE_MODEL = process.env.NOVA_PRO_MODEL_ID || "amazon.nova-pro-v1:0";
const NOVA_PRO_MODEL = process.env.NOVA_PRO_MODEL_ID || "amazon.nova-pro-v1:0";

export class AIInterviewFlow {
  
  // STEP 1: Analyze Resume with ATS and comprehensive feedback
  async analyzeResumeComprehensive(resumeText: string) {
    const prompt = `Analyze this resume from ANY industry/country and return ONLY valid JSON:

${resumeText}

Detect the industry, role level, and skills. Return this exact JSON structure:
{
  "atsScore": number,
  "overallScore": number,
  "detectedIndustry": "Technology|Healthcare|Finance|Marketing|Sales|Education|Engineering|Design|Legal|Consulting|Other",
  "detectedRole": "detected job title",
  "experienceLevel": "Entry|Mid|Senior|Executive",
  "suggestedCategories": ["Technical Skills", "Leadership", "Communication", "Problem Solving"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "keywords": {
    "missing": ["keyword1", "keyword2"],
    "present": ["keyword1", "keyword2"]
  },
  "improvements": ["improvement1", "improvement2"],
  "interviewTopics": ["topic1", "topic2"],
  "recommendedRoles": ["role1", "role2"]
}`;

    return this.invokeModel(prompt, 1000, NOVA_PRO_MODEL);
  }

  // STEP 2: Generate interview sections based on resume analysis
  async generateInterviewSections(resumeAnalysis: any) {
    const industry = resumeAnalysis.detectedIndustry || 'General';
    const level = resumeAnalysis.experienceLevel?.toLowerCase() || 'intermediate';
    
    const prompt = `Create interview sections for ${industry} industry at ${level} level. Return ONLY JSON:

{
  "sections": [
    {
      "id": "technical",
      "title": "Technical Skills",
      "description": "${industry}-specific technical questions",
      "questions": ["question1", "question2"],
      "difficulty": "${level}"
    },
    {
      "id": "behavioral",
      "title": "Behavioral Questions",
      "description": "STAR method practice",
      "questions": ["question1", "question2"],
      "difficulty": "${level}"
    },
    {
      "id": "industry",
      "title": "${industry} Specific",
      "description": "Industry knowledge and trends",
      "questions": ["question1", "question2"],
      "difficulty": "${level}"
    }
  ]
}`;

    return this.invokeModel(prompt, 600, NOVA_PRO_MODEL);
  }

  // STEP 3: Start AI Interview with personality
  async startInterview(selectedSections: string[], resumeContext: any) {
    const prompt = `You are Sarah, a friendly and professional AI interviewer. You're about to conduct a practice interview.

Resume Context: ${JSON.stringify(resumeContext)}
Selected Sections: ${selectedSections.join(', ')}

Introduce yourself warmly and explain:
1. Your name and role
2. What sections you'll cover
3. That this is a safe practice environment
4. Ask if they're ready to begin

Keep it conversational, encouraging, and under 150 words. Show personality - be professional but approachable.`;

    return this.invokeModel(prompt, 300, NOVA_PRO_MODEL);
  }

  // STEP 4: Conduct interview conversation
  async continueInterview(userResponse: string, context: any) {
    const prompt = `You are Sarah, the AI interviewer. Continue this interview conversation.

Context: ${JSON.stringify(context)}
User Response: "${userResponse}"

Respond as Sarah would:
- Ask follow-up questions
- Provide gentle encouragement
- Keep the conversation flowing naturally
- Stay in character as a supportive interviewer
- Ask one question at a time
- Keep responses under 100 words

Be professional, playful when appropriate, and understanding.`;

    return this.invokeModel(prompt, 250, NOVA_PRO_MODEL);
  }

  // STEP 5: Provide comprehensive feedback
  async provideFinalFeedback(transcript: string, interviewContext: any) {
    const prompt = `You are Sarah, providing final interview feedback. Analyze this complete interview:

Transcript: ${transcript}
Context: ${JSON.stringify(interviewContext)}

Provide encouraging but honest feedback in JSON format:
{
  "overallScore": number (1-10),
  "strengths": ["strength1", "strength2", ...],
  "areasToImprove": ["area1", "area2", ...],
  "specificFeedback": {
    "communication": { "score": number, "feedback": "string" },
    "technicalKnowledge": { "score": number, "feedback": "string" },
    "problemSolving": { "score": number, "feedback": "string" },
    "confidence": { "score": number, "feedback": "string" }
  },
  "nextSteps": ["step1", "step2", ...],
  "encouragingMessage": "A personal, encouraging message from Sarah"
}

Be supportive, specific, and actionable. Remember you're Sarah - caring but professional.`;

    return this.invokeModel(prompt, 800, CLAUDE_MODEL);
  }

  // Voice-specific methods for transcription integration
  async processVoiceResponse(audioTranscript: string, context: any) {
    const prompt = `Process this voice response in an interview context:

Transcript: "${audioTranscript}"
Context: ${JSON.stringify(context)}

Respond naturally as Sarah, acknowledging what they said and asking a relevant follow-up question. Keep it conversational and under 80 words.`;

    return this.invokeModel(prompt, 200, NOVA_PRO_MODEL);
  }

  private async invokeModel(prompt: string, maxTokens: number, modelId: string) {
    try {
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify({
          messages: [{ 
            role: "user", 
            content: [{ text: prompt }]
          }],
          inferenceConfig: {
            maxTokens,
            temperature: 0.7
          }
        }),
        contentType: "application/json",
      });

      const response = await client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      let responseText = result.output?.message?.content?.[0]?.text;
      if (!responseText) throw new Error('No response text');
      
      // Extract JSON from response if it contains extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }
      
      return responseText;
    } catch (error) {
      console.error('Bedrock Error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Public method to expose invokeModel for external use
  async callModel(prompt: string, maxTokens: number, modelId: string) {
    return this.invokeModel(prompt, maxTokens, modelId);
  }
}

export const aiInterviewFlow = new AIInterviewFlow();