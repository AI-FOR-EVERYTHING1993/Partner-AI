import { bedrockService } from "@/lib/bedrock";

export async function POST(request: Request) {
  try {
    const { action, message, interviewData, transcript } = await request.json();

    if (action === 'start') {
      // Generate an engaging opening message
      const openingPrompt = `You are starting an interview for a ${interviewData.role} position at ${interviewData.level} level. The candidate's focus areas are: ${interviewData.techstack.join(', ')}.

Generate a warm, professional opening greeting that:
1. Welcomes the candidate
2. Introduces yourself as their AI interviewer
3. Asks an engaging opening question about their background
4. Sets a positive, encouraging tone

Keep it conversational and under 100 words.`;
      
      const response = await bedrockService.generateInterviewResponse(openingPrompt, interviewData);
      return Response.json({ success: true, response, isOpening: true });
    }

    if (message && interviewData) {
      const response = await bedrockService.generateInterviewResponse(message, interviewData);
      return Response.json({ success: true, response });
    }

    if (transcript) {
      const analysis = await bedrockService.analyzeInterviewPerformance(transcript, interviewData);
      return Response.json({ success: true, analysis });
    }

    return Response.json({ success: false, error: "Missing required data" }, { status: 400 });
  } catch (error) {
    console.error("Bedrock API error:", error);
    return Response.json({ success: false, error: "AI service unavailable" }, { status: 500 });
  }
}