import { bedrockService } from "@/lib/bedrock";

export async function POST(request: Request) {
  try {
    const { resumeText, action, category } = await request.json();

    if (action === 'analyze') {
      const analysis = await bedrockService.analyzeResume(resumeText, category);
      return Response.json({ success: true, analysis });
    }

    if (action === 'improve') {
      const improvementPrompt = `Based on this resume, provide specific improvement suggestions:

${resumeText}

Generate:
1. **Rewritten Summary**: A more compelling professional summary
2. **Enhanced Bullet Points**: Improve 3-5 key bullet points with metrics and impact
3. **Skills Optimization**: Suggest additional relevant skills to add
4. **Formatting Tips**: Specific formatting improvements
5. **Keywords**: Industry-relevant keywords to include

Provide concrete, actionable improvements.`;

      const improvements = await bedrockService.generateInterviewResponse(improvementPrompt, {
        role: 'Resume Writer',
        level: 'Expert', 
        techstack: ['Resume Writing', 'Career Development']
      });

      return Response.json({ success: true, improvements });
    }

    return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return Response.json({ success: false, error: "Analysis service unavailable" }, { status: 500 });
  }
}