import { novaSonicService } from "@/lib/nova-sonic";

export async function POST(request: Request) {
  try {
    const { action, sessionId, userInput, audioData, interviewData } = await request.json();

    switch (action) {
      case 'start':
        const newSessionId = await novaSonicService.startVoiceSession(interviewData);
        return Response.json({ success: true, sessionId: newSessionId });

      case 'process':
        if (!sessionId || !audioData) {
          return Response.json({ success: false, error: "Missing sessionId or audioData" }, { status: 400 });
        }
        const aiResponse = await novaSonicService.processVoiceInput(sessionId, audioData);
        return Response.json({ success: true, response: aiResponse });

      case 'end':
        if (!sessionId) {
          return Response.json({ success: false, error: "Missing sessionId" }, { status: 400 });
        }
        await novaSonicService.endVoiceSession(sessionId);
        return Response.json({ success: true });

      default:
        return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Nova Sonic API error:", error);
    return Response.json({ success: false, error: "Voice service unavailable" }, { status: 500 });
  }
}