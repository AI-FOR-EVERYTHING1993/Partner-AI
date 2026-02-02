import { aiInterviewFlow } from "@/lib/ai-interview-flow";

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'analyze-resume':
        const { resumeText } = data;
        if (!resumeText) {
          return Response.json({ error: "Resume text required" }, { status: 400 });
        }
        
        const analysis = await aiInterviewFlow.analyzeResumeComprehensive(resumeText);
        return Response.json({ success: true, analysis: JSON.parse(analysis) });

      case 'generate-sections':
        const { resumeAnalysis } = data;
        if (!resumeAnalysis) {
          return Response.json({ error: "Resume analysis required" }, { status: 400 });
        }
        
        const sections = await aiInterviewFlow.generateInterviewSections(resumeAnalysis);
        return Response.json({ success: true, sections: JSON.parse(sections) });

      case 'start-interview':
        const { selectedSections, resumeContext } = data;
        if (!selectedSections || !resumeContext) {
          return Response.json({ error: "Selected sections and resume context required" }, { status: 400 });
        }
        
        const introduction = await aiInterviewFlow.startInterview(selectedSections, resumeContext);
        return Response.json({ success: true, introduction });

      case 'continue-interview':
        const { userResponse, context } = data;
        if (!userResponse || !context) {
          return Response.json({ error: "User response and context required" }, { status: 400 });
        }
        
        const response = await aiInterviewFlow.continueInterview(userResponse, context);
        return Response.json({ success: true, response });

      case 'voice-response':
        const { audioTranscript, interviewContext } = data;
        if (!audioTranscript || !interviewContext) {
          return Response.json({ error: "Audio transcript and context required" }, { status: 400 });
        }
        
        const voiceResponse = await aiInterviewFlow.processVoiceResponse(audioTranscript, interviewContext);
        return Response.json({ success: true, response: voiceResponse });

      case 'final-feedback':
        const { transcript, feedbackContext } = data;
        if (!transcript || !feedbackContext) {
          return Response.json({ error: "Transcript and context required" }, { status: 400 });
        }
        
        const feedback = await aiInterviewFlow.provideFinalFeedback(transcript, feedbackContext);
        return Response.json({ success: true, feedback: JSON.parse(feedback) });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI Interview Flow Error:", error);
    return Response.json({ 
      error: "AI service unavailable", 
      details: error.message 
    }, { status: 500 });
  }
}