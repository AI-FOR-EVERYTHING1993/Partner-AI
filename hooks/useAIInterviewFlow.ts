import { useState, useCallback } from 'react';

interface ResumeAnalysis {
  atsScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  keywords: {
    missing: string[];
    present: string[];
  };
  sections: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
  improvements: string[];
  interviewTopics: string[];
  recommendedRoles: string[];
}

interface InterviewSection {
  id: string;
  title: string;
  description: string;
  questions: string[];
  difficulty: string;
}

interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  areasToImprove: string[];
  specificFeedback: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
  nextSteps: string[];
  encouragingMessage: string;
}

export const useAIInterviewFlow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Resume Analysis
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  
  // Step 2: Interview Sections
  const [interviewSections, setInterviewSections] = useState<InterviewSection[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  
  // Step 3: Interview Session
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [conversation, setConversation] = useState<Array<{role: 'ai' | 'user', message: string, timestamp: Date}>>([]);
  const [interviewContext, setInterviewContext] = useState<any>(null);
  
  // Step 4: Final Feedback
  const [finalFeedback, setFinalFeedback] = useState<InterviewFeedback | null>(null);

  const callAPI = async (action: string, data: any) => {
    const response = await fetch('/api/ai-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API call failed');
    }
    
    return response.json();
  };

  // STEP 1: Analyze Resume
  const analyzeResume = useCallback(async (resumeText: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await callAPI('analyze-resume', { resumeText });
      setResumeAnalysis(result.analysis);
      return result.analysis;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // STEP 2: Generate Interview Sections
  const generateSections = useCallback(async (analysis?: ResumeAnalysis) => {
    const analysisToUse = analysis || resumeAnalysis;
    if (!analysisToUse) throw new Error('Resume analysis required');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await callAPI('generate-sections', { resumeAnalysis: analysisToUse });
      setInterviewSections(result.sections.sections);
      return result.sections.sections;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resumeAnalysis]);

  // STEP 3: Start Interview
  const startInterview = useCallback(async (sections: string[], resumeContext?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const context = resumeContext || resumeAnalysis;
      const result = await callAPI('start-interview', { 
        selectedSections: sections, 
        resumeContext: context 
      });
      
      setSelectedSections(sections);
      setInterviewContext(context);
      setInterviewStarted(true);
      setConversation([{
        role: 'ai',
        message: result.introduction,
        timestamp: new Date()
      }]);
      
      return result.introduction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resumeAnalysis]);

  // Continue Interview Conversation
  const continueInterview = useCallback(async (userResponse: string) => {
    if (!interviewContext) throw new Error('Interview not started');
    
    setLoading(true);
    setError(null);
    
    try {
      // Add user response to conversation
      const userMessage = {
        role: 'user' as const,
        message: userResponse,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, userMessage]);
      
      const result = await callAPI('continue-interview', {
        userResponse,
        context: {
          ...interviewContext,
          selectedSections,
          conversationHistory: conversation
        }
      });
      
      // Add AI response to conversation
      const aiMessage = {
        role: 'ai' as const,
        message: result.response,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      return result.response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [interviewContext, selectedSections, conversation]);

  // Process Voice Response
  const processVoiceResponse = useCallback(async (audioTranscript: string) => {
    if (!interviewContext) throw new Error('Interview not started');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await callAPI('voice-response', {
        audioTranscript,
        interviewContext: {
          ...interviewContext,
          selectedSections,
          conversationHistory: conversation
        }
      });
      
      // Add both user transcript and AI response to conversation
      setConversation(prev => [
        ...prev,
        { role: 'user', message: audioTranscript, timestamp: new Date() },
        { role: 'ai', message: result.response, timestamp: new Date() }
      ]);
      
      return result.response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [interviewContext, selectedSections, conversation]);

  // STEP 4: Get Final Feedback
  const getFinalFeedback = useCallback(async () => {
    if (!conversation.length || !interviewContext) {
      throw new Error('No interview data available');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const transcript = conversation
        .map(msg => `${msg.role.toUpperCase()}: ${msg.message}`)
        .join('\n\n');
      
      const result = await callAPI('final-feedback', {
        transcript,
        feedbackContext: {
          ...interviewContext,
          selectedSections,
          conversationLength: conversation.length
        }
      });
      
      setFinalFeedback(result.feedback);
      return result.feedback;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversation, interviewContext, selectedSections]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setResumeAnalysis(null);
    setInterviewSections([]);
    setSelectedSections([]);
    setInterviewStarted(false);
    setConversation([]);
    setInterviewContext(null);
    setFinalFeedback(null);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    resumeAnalysis,
    interviewSections,
    selectedSections,
    interviewStarted,
    conversation,
    finalFeedback,
    
    // Actions
    analyzeResume,
    generateSections,
    startInterview,
    continueInterview,
    processVoiceResponse,
    getFinalFeedback,
    resetFlow,
    
    // Setters for manual control
    setSelectedSections,
    setError
  };
};