/**
 * AI-First Interview Prompt Templates
 * 
 * These prompts are designed to make the AI initiate conversations
 * and maintain engaging dialogue throughout the interview process.
 */

export const AI_FIRST_PROMPTS = {
  // System prompt for AI-first behavior
  SYSTEM_PROMPT: `You are an AI interviewer who ALWAYS speaks first. Your role is to:

1. IMMEDIATELY greet the candidate when the session starts
2. Take the lead in conversation flow
3. Ask engaging, relevant questions
4. Provide encouraging feedback
5. Guide the interview naturally

CRITICAL: Never wait for the user to speak first. You must initiate every conversation.`,

  // Opening greeting templates
  OPENING_GREETINGS: {
    PROFESSIONAL: (role: string, level: string) => 
      `Hello! Welcome to your ${role} interview. I'm your AI interviewer today, and I'm excited to learn more about your background and experience. To start us off, could you tell me what initially drew you to ${role} and what you're most passionate about in this field?`,
    
    CASUAL: (role: string, techStack: string[]) => 
      `Hi there! Great to meet you! I'll be conducting your ${role} interview today. I see you have experience with ${techStack.slice(0, 2).join(' and ')} - that's awesome! Let's dive right in: what's been your favorite project to work on recently?`,
    
    TECHNICAL: (role: string, level: string, techStack: string[]) => 
      `Welcome! I'm excited to discuss your ${role} background today. Given your ${level} level experience with ${techStack.join(', ')}, I'd love to start with this: can you walk me through a challenging technical problem you've solved recently?`,
    
    ENCOURAGING: (role: string) => 
      `Hello and welcome! I'm thrilled you're here for this ${role} interview. Don't worry - this will be a friendly conversation about your experience and interests. To break the ice, why don't you tell me what you love most about working in technology?`
  },

  // Follow-up question generators
  FOLLOW_UP_GENERATORS: {
    TECHNICAL_DEEP_DIVE: (techStack: string[]) => [
      `That's interesting! Can you elaborate on how you used ${techStack[0]} in that project?`,
      `What challenges did you face when implementing that solution?`,
      `How did you decide on that particular approach?`,
      `What would you do differently if you had to solve it again?`
    ],
    
    BEHAVIORAL: [
      `That sounds like great experience! How do you typically approach learning new technologies?`,
      `Tell me about a time when you had to collaborate with a difficult team member.`,
      `How do you handle tight deadlines and pressure?`,
      `What motivates you to do your best work?`
    ],
    
    PROBLEM_SOLVING: [
      `Interesting approach! Walk me through your problem-solving process.`,
      `How do you debug complex issues?`,
      `What's your strategy when you're stuck on a problem?`,
      `How do you ensure code quality in your projects?`
    ]
  },

  // Conversation flow prompts
  CONVERSATION_FLOW: {
    TRANSITION_SMOOTH: [
      `That's a great point! Building on that...`,
      `I love that perspective! Let me ask you this...`,
      `Excellent! That leads me to my next question...`,
      `Perfect! Now I'm curious about...`
    ],
    
    ENCOURAGEMENT: [
      `You're doing great! `,
      `That's exactly the kind of thinking we're looking for! `,
      `Excellent answer! `,
      `I can tell you've really thought about this! `
    ],
    
    CLARIFICATION: [
      `That's helpful! Could you give me a bit more detail about...`,
      `I'd love to understand better - can you explain...`,
      `That's a good start! What else can you tell me about...`,
      `Interesting! Help me understand...`
    ]
  },

  // Ending prompts
  INTERVIEW_ENDINGS: {
    POSITIVE: `Thank you for such an engaging conversation! You've shared some really impressive experiences. Do you have any questions about the role or our company before we wrap up?`,
    
    ENCOURAGING: `This has been a wonderful interview! I've really enjoyed learning about your background and approach to problem-solving. Is there anything else you'd like to share or any questions for me?`,
    
    PROFESSIONAL: `Excellent! We've covered a lot of ground today. I appreciate you taking the time to share your experiences with me. Any final questions or thoughts you'd like to discuss?`
  }
};

// Utility function to generate AI-first prompts
export const generateAIFirstPrompt = (
  interviewData: {
    role: string;
    level: string;
    techstack: string[];
  },
  style: 'PROFESSIONAL' | 'CASUAL' | 'TECHNICAL' | 'ENCOURAGING' = 'PROFESSIONAL'
) => {
  const systemPrompt = AI_FIRST_PROMPTS.SYSTEM_PROMPT;
  const greeting = AI_FIRST_PROMPTS.OPENING_GREETINGS[style](
    interviewData.role, 
    interviewData.level, 
    interviewData.techstack
  );
  
  return {
    systemPrompt: `${systemPrompt}

Interview Context:
- Role: ${interviewData.role}
- Level: ${interviewData.level}
- Tech Stack: ${interviewData.techstack.join(', ')}

Your opening message should be: "${greeting}"

After the opening, maintain conversational flow with follow-up questions. Keep responses under 50 words unless asking complex technical questions.`,
    
    openingMessage: greeting
  };
};

// Example usage:
/*
const interviewData = {
  role: "Frontend Developer",
  level: "Senior",
  techstack: ["React", "TypeScript", "Node.js"]
};

const prompt = generateAIFirstPrompt(interviewData, 'TECHNICAL');
console.log(prompt.systemPrompt);
console.log(prompt.openingMessage);
*/