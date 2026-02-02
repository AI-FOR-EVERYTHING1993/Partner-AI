import { bedrockService } from "@/lib/bedrock";

export async function POST(request: Request) {
  try {
    const { action, message, interviewData, transcript, category, difficulty } = await request.json();

    if (action === 'start') {
      if (!interviewData || !interviewData.role || !interviewData.level || !interviewData.techstack) {
        return Response.json({ success: false, error: "Missing required interview data (role, level, techstack)" }, { status: 400 });
      }
      const questions = await bedrockService.generateInterviewQuestions(
        interviewData.role,
        interviewData.level,
        interviewData.techstack
      );
      return Response.json({ success: true, response: questions, isOpening: true });
    }

    if (action === 'voice-practice') {
      if (!category || !difficulty) {
        return Response.json({ success: false, error: "Missing required parameters (category, difficulty)" }, { status: 400 });
      }
      const prompts = await bedrockService.generateVoicePrompts(category, difficulty);
      return Response.json({ success: true, prompts });
    }

    if (action === 'feedback') {
      if (!transcript || !interviewData) {
        return Response.json({ success: false, error: "Missing required parameters (transcript, interviewData)" }, { status: 400 });
      }
      const feedback = await bedrockService.provideFeedback(transcript, interviewData);
      return Response.json({ success: true, feedback });
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