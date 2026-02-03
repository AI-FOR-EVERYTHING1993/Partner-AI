import { enterpriseModelService } from "@/lib/enterprise";

export async function POST(request: Request) {
  try {
    const { action, data, userId } = await request.json();

    switch (action) {
      case 'analyze-resume':
        const { resumeText, category } = data;
        if (!resumeText) {
          return Response.json({ error: "Resume text required" }, { status: 400 });
        }
        
        const analysis = await enterpriseModelService.analyzeResume(resumeText, category, userId);
        return Response.json({ 
          success: analysis.success, 
          analysis: analysis.success ? JSON.parse(analysis.content) : null,
          metadata: {
            model: analysis.modelId,
            quality: analysis.metadata.quality.score,
            cached: analysis.cached,
            processingTime: analysis.metadata.processingTime
          }
        });

      case 'generate-sections':
        const { resumeAnalysis } = data;
        if (!resumeAnalysis) {
          return Response.json({ error: "Resume analysis required" }, { status: 400 });
        }
        
        const sectionsPrompt = `Based on this resume analysis, generate 5 interview focus areas:\n${JSON.stringify(resumeAnalysis)}\n\nReturn as JSON array with: [{"title": "Area", "description": "Focus", "questions": 3}]`;
        const sections = await enterpriseModelService.invoke({
          modelId: process.env.FAST_MODEL!,
          prompt: sectionsPrompt,
          responseType: 'general',
          userId
        });
        
        return Response.json({ 
          success: sections.success, 
          sections: sections.success ? JSON.parse(sections.content) : null,
          metadata: { model: sections.modelId, quality: sections.metadata.quality.score }
        });

      case 'start-interview':
        const { selectedSections, resumeContext } = data;
        if (!selectedSections || !resumeContext) {
          return Response.json({ error: "Selected sections and resume context required" }, { status: 400 });
        }
        
        const introPrompt = `Start an interview focusing on: ${selectedSections.join(', ')}. Resume context: ${JSON.stringify(resumeContext)}. Provide a warm introduction and first question.`;
        const introduction = await enterpriseModelService.conductInterview(introPrompt, { sections: selectedSections, resume: resumeContext }, userId);
        
        return Response.json({ 
          success: introduction.success, 
          introduction: introduction.content,
          metadata: { model: introduction.modelId, quality: introduction.metadata.quality.score }
        });

      case 'continue-interview':
        const { userResponse, context } = data;
        if (!userResponse || !context) {
          return Response.json({ error: "User response and context required" }, { status: 400 });
        }
        
        const response = await enterpriseModelService.conductInterview(userResponse, context, userId);
        return Response.json({ 
          success: response.success, 
          response: response.content,
          metadata: { model: response.modelId, quality: response.metadata.quality.score }
        });

      case 'voice-response':
        const { audioTranscript, interviewContext } = data;
        if (!audioTranscript || !interviewContext) {
          return Response.json({ error: "Audio transcript and context required" }, { status: 400 });
        }
        
        const voiceResponse = await enterpriseModelService.conductInterview(audioTranscript, { ...interviewContext, mode: 'voice' }, userId);
        return Response.json({ 
          success: voiceResponse.success, 
          response: voiceResponse.content,
          metadata: { model: voiceResponse.modelId, quality: voiceResponse.metadata.quality.score }
        });

      case 'final-feedback':
        const { transcript, feedbackContext } = data;
        if (!transcript || !feedbackContext) {
          return Response.json({ error: "Transcript and context required" }, { status: 400 });
        }
        
        const feedback = await enterpriseModelService.provideFeedback(transcript, feedbackContext, userId);
        return Response.json({ 
          success: feedback.success, 
          feedback: feedback.success ? JSON.parse(feedback.content) : null,
          metadata: { model: feedback.modelId, quality: feedback.metadata.quality.score }
        });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Enterprise AI Interview Error:", error);
    return Response.json({ 
      error: "AI service unavailable", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}