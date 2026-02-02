import { bedrockService } from "@/lib/bedrock";

export async function POST(request: Request) {
  try {
    const { category, difficulty, userResponse, scenario } = await request.json();

    if (scenario && userResponse) {
      // Analyze voice response
      const feedback = await bedrockService.provideFeedback(userResponse, {
        role: 'Voice Coach',
        level: difficulty,
        category
      });
      return Response.json({ success: true, feedback });
    }

    // Generate practice scenarios
    const prompts = await bedrockService.generateVoicePrompts(category, difficulty);
    return Response.json({ success: true, prompts });

  } catch (error) {
    console.error("Voice practice error:", error);
    return Response.json({ success: false, error: "Voice practice service unavailable" }, { status: 500 });
  }
}