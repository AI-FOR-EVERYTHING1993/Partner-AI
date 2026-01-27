import { pollyService } from "@/lib/polly";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return Response.json({ success: false, error: "Text required" }, { status: 400 });
    }
    
    const audioUrl = await pollyService.textToSpeech(text);
    
    return Response.json({ success: true, audioUrl });
  } catch (error) {
    console.error("Polly TTS error:", error);
    return Response.json({ success: false, error: "TTS service unavailable" }, { status: 500 });
  }
}