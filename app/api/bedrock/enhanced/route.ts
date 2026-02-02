import { enhancedBedrockService } from "@/lib/bedrock-enhanced";
import { TECHNICAL_INTERVIEWS, NON_TECHNICAL_INTERVIEWS } from "@/constants/interviews";

export async function POST(request: Request) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'analyze-resume':
        return await handleResumeAnalysis(data);
      
      case 'recommend-categories':
        return await handleCategoryRecommendation(data);
      
      case 'generate-questions':
        return await handleQuestionGeneration(data);
      
      case 'stream-response':
        return await handleStreamingResponse(data);
      
      case 'evaluate-performance':
        return await handlePerformanceEvaluation(data);
      
      default:
        return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Enhanced Bedrock API error:", error);
    return Response.json({ 
      success: false, 
      error: "AI service temporarily unavailable" 
    }, { status: 500 });
  }
}

// 🎯 Resume Analysis with Category Recommendations
async function handleResumeAnalysis({ resumeText, includeRecommendations = true }) {
  if (!resumeText) {
    return Response.json({ success: false, error: "Resume text required" }, { status: 400 });
  }

  const analysis = await enhancedBedrockService.analyzeResumeWithRecommendations(resumeText);
  
  let categoryRecommendations = null;
  if (includeRecommendations) {
    const allCategories = [...TECHNICAL_INTERVIEWS, ...NON_TECHNICAL_INTERVIEWS];
    categoryRecommendations = await enhancedBedrockService.findBestMatchingCategories(
      resumeText, 
      allCategories
    );
  }

  return Response.json({
    success: true,
    analysis: JSON.parse(analysis),
    categoryRecommendations
  });
}

// 🎯 Smart Category Recommendation
async function handleCategoryRecommendation({ resumeText, preferences = {} }) {
  const allCategories = [...TECHNICAL_INTERVIEWS, ...NON_TECHNICAL_INTERVIEWS];
  
  // Filter categories based on user preferences
  let filteredCategories = allCategories;
  if (preferences.type === 'technical') {
    filteredCategories = TECHNICAL_INTERVIEWS;
  } else if (preferences.type === 'non-technical') {
    filteredCategories = NON_TECHNICAL_INTERVIEWS;
  }

  const recommendations = await enhancedBedrockService.findBestMatchingCategories(
    resumeText,
    filteredCategories
  );

  return Response.json({
    success: true,
    recommendations: recommendations.map(rec => ({
      ...rec,
      reasoning: `Based on your ${rec.matchScore}% skill match, particularly in ${rec.skills?.slice(0, 3).join(', ')}`
    }))
  });
}

// 🎯 Contextual Question Generation
async function handleQuestionGeneration({ category, level, resumeContext, questionCount = 5 }) {
  if (!category || !level) {
    return Response.json({ 
      success: false, 
      error: "Category and level required" 
    }, { status: 400 });
  }

  const questions = await enhancedBedrockService.generateContextualQuestions(
    category,
    level,
    resumeContext
  );

  return Response.json({
    success: true,
    questions: JSON.parse(questions),
    metadata: {
      category,
      level,
      generatedAt: new Date().toISOString(),
      hasResumeContext: !!resumeContext
    }
  });
}

// 🎯 Streaming Interview Response
async function handleStreamingResponse({ userMessage, interviewContext }) {
  if (!userMessage || !interviewContext) {
    return Response.json({ 
      success: false, 
      error: "Message and interview context required" 
    }, { status: 400 });
  }

  // Create a readable stream for real-time responses
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = '';
        
        for await (const chunk of enhancedBedrockService.streamInterviewResponse(
          userMessage, 
          interviewContext
        )) {
          fullResponse += chunk;
          
          // Send each chunk as Server-Sent Events format
          const data = `data: ${JSON.stringify({ 
            type: 'chunk', 
            content: chunk,
            timestamp: Date.now()
          })}\n\n`;
          
          controller.enqueue(encoder.encode(data));
        }

        // Send completion signal
        const completion = `data: ${JSON.stringify({ 
          type: 'complete', 
          fullResponse,
          timestamp: Date.now()
        })}\n\n`;
        
        controller.enqueue(encoder.encode(completion));
        controller.close();
        
      } catch (error) {
        console.error('Streaming error:', error);
        const errorData = `data: ${JSON.stringify({ 
          type: 'error', 
          error: 'Stream interrupted' 
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// 🎯 Comprehensive Performance Evaluation
async function handlePerformanceEvaluation({ transcript, interviewData, includeNextSteps = true }) {
  if (!transcript || !interviewData) {
    return Response.json({ 
      success: false, 
      error: "Transcript and interview data required" 
    }, { status: 400 });
  }

  const evaluation = await enhancedBedrockService.evaluateInterviewPerformance(
    transcript,
    interviewData
  );

  const parsedEvaluation = JSON.parse(evaluation);

  // Add performance insights
  const insights = generatePerformanceInsights(parsedEvaluation);

  return Response.json({
    success: true,
    evaluation: parsedEvaluation,
    insights,
    metadata: {
      evaluatedAt: new Date().toISOString(),
      transcriptLength: transcript.length,
      interviewDuration: interviewData.duration,
      role: interviewData.role,
      level: interviewData.level
    }
  });
}

// 🎯 Helper Functions
function generatePerformanceInsights(evaluation: any) {
  const { overallScore, categoryScores } = evaluation;
  
  const insights = {
    performanceLevel: getPerformanceLevel(overallScore),
    strongestArea: Object.entries(categoryScores).reduce((a, b) => 
      categoryScores[a[0]] > categoryScores[b[0]] ? a : b
    )[0],
    weakestArea: Object.entries(categoryScores).reduce((a, b) => 
      categoryScores[a[0]] < categoryScores[b[0]] ? a : b
    )[0],
    readinessIndicator: calculateReadiness(categoryScores),
    improvementPriority: evaluation.improvements
      ?.filter((imp: any) => imp.priority === 'high')
      ?.slice(0, 3) || []
  };

  return insights;
}

function getPerformanceLevel(score: number): string {
  if (score >= 8.5) return 'Excellent - Ready for senior roles';
  if (score >= 7.0) return 'Strong - Ready for target role';
  if (score >= 5.5) return 'Good - Some preparation needed';
  if (score >= 4.0) return 'Fair - Significant preparation required';
  return 'Needs Improvement - Extensive preparation needed';
}

function calculateReadiness(categoryScores: Record<string, number>): string {
  const avgScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.values(categoryScores).length;
  const consistency = Math.min(...Object.values(categoryScores)) / Math.max(...Object.values(categoryScores));
  
  if (avgScore >= 7 && consistency >= 0.8) return 'Interview Ready';
  if (avgScore >= 6 && consistency >= 0.7) return 'Nearly Ready';
  if (avgScore >= 5) return 'Needs Practice';
  return 'Requires Preparation';
}