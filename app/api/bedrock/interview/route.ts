import { bedrockService } from "@/lib/bedrock";

export async function POST(request: Request) {
  try {
    const { action, message, interviewData, transcript } = await request.json();

    if (action === 'start') {
      const response = await bedrockService.generateInterviewResponse(
        "Let's begin the interview", 
        interviewData
      );
      return Response.json({ success: true, response });
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