import { bedrockService } from "@/lib/bedrock";

export async function POST(request: Request) {
  try {
    const { resumeText, category } = await request.json();

    if (!resumeText) {
      return Response.json({ success: false, error: "Resume text is required" }, { status: 400 });
    }

    const analysis = await bedrockService.analyzeResume(resumeText, category);
    
    return Response.json({ success: true, analysis });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return Response.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}