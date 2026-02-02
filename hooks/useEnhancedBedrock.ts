import { useState, useCallback, useRef, useEffect } from 'react';

// 🎯 Hook for Enhanced Resume Analysis
export function useEnhancedResumeAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeResume = useCallback(async (resumeText: string, includeRecommendations = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bedrock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-resume',
          resumeText,
          includeRecommendations
        })
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
        setRecommendations(data.categoryRecommendations || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analysis,
    recommendations,
    loading,
    error,
    analyzeResume
  };
}

// 🎯 Hook for Category Recommendations
export function useCategoryRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecommendations = useCallback(async (resumeText: string, preferences = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bedrock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend-categories',
          resumeText,
          preferences
        })
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommendations,
    loading,
    error,
    getRecommendations
  };
}

// 🎯 Hook for Contextual Question Generation
export function useContextualQuestions() {
  const [questions, setQuestions] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuestions = useCallback(async (category: string, level: string, resumeContext?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bedrock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-questions',
          category,
          level,
          resumeContext
        })
      });

      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions.questions || []);
        setMetadata(data.metadata);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    questions,
    metadata,
    loading,
    error,
    generateQuestions
  };
}

// 🎯 Hook for Streaming Interview Responses
export function useStreamingInterview() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const sendMessage = useCallback(async (userMessage: string, interviewContext: any) => {
    setIsStreaming(true);
    setError(null);
    setResponse('');

    try {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const response = await fetch('/api/bedrock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stream-response',
          userMessage,
          interviewContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk') {
                  setResponse(prev => prev + data.content);
                } else if (data.type === 'complete') {
                  setIsStreaming(false);
                } else if (data.type === 'error') {
                  setError(data.error);
                  setIsStreaming(false);
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to get response');
      setIsStreaming(false);
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    response,
    isStreaming,
    error,
    sendMessage,
    stopStreaming
  };
}

// 🎯 Hook for Performance Evaluation
export function usePerformanceEvaluation() {
  const [evaluation, setEvaluation] = useState(null);
  const [insights, setInsights] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const evaluatePerformance = useCallback(async (transcript: string, interviewData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bedrock/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate-performance',
          transcript,
          interviewData,
          includeNextSteps: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setEvaluation(data.evaluation);
        setInsights(data.insights);
        setMetadata(data.metadata);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to evaluate performance');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    evaluation,
    insights,
    metadata,
    loading,
    error,
    evaluatePerformance
  };
}

// 🎯 Combined Hook for Complete Interview Flow
export function useEnhancedInterview() {
  const resumeAnalysis = useEnhancedResumeAnalysis();
  const categoryRecommendations = useCategoryRecommendations();
  const contextualQuestions = useContextualQuestions();
  const streamingInterview = useStreamingInterview();
  const performanceEvaluation = usePerformanceEvaluation();

  const [interviewState, setInterviewState] = useState({
    phase: 'setup', // setup, questions, interview, evaluation, results
    currentQuestion: 0,
    transcript: '',
    startTime: null,
    endTime: null
  });

  const startInterview = useCallback(async (category: string, level: string, resumeContext?: string) => {
    setInterviewState(prev => ({
      ...prev,
      phase: 'questions',
      startTime: new Date()
    }));

    await contextualQuestions.generateQuestions(category, level, resumeContext);
    
    setInterviewState(prev => ({
      ...prev,
      phase: 'interview'
    }));
  }, [contextualQuestions.generateQuestions]);

  const nextQuestion = useCallback(() => {
    setInterviewState(prev => ({
      ...prev,
      currentQuestion: prev.currentQuestion + 1
    }));
  }, []);

  const endInterview = useCallback(async (interviewData: any) => {
    setInterviewState(prev => ({
      ...prev,
      phase: 'evaluation',
      endTime: new Date()
    }));

    await performanceEvaluation.evaluatePerformance(
      interviewState.transcript,
      {
        ...interviewData,
        duration: interviewState.endTime && interviewState.startTime 
          ? Math.round((interviewState.endTime.getTime() - interviewState.startTime.getTime()) / 1000 / 60)
          : null
      }
    );

    setInterviewState(prev => ({
      ...prev,
      phase: 'results'
    }));
  }, [interviewState.transcript, interviewState.startTime, interviewState.endTime, performanceEvaluation.evaluatePerformance]);

  const addToTranscript = useCallback((text: string) => {
    setInterviewState(prev => ({
      ...prev,
      transcript: prev.transcript + '\n' + text
    }));
  }, []);

  return {
    // Individual hooks
    resumeAnalysis,
    categoryRecommendations,
    contextualQuestions,
    streamingInterview,
    performanceEvaluation,
    
    // Interview state management
    interviewState,
    startInterview,
    nextQuestion,
    endInterview,
    addToTranscript,
    
    // Computed properties
    isLoading: resumeAnalysis.loading || categoryRecommendations.loading || 
               contextualQuestions.loading || streamingInterview.isStreaming || 
               performanceEvaluation.loading,
    
    hasError: resumeAnalysis.error || categoryRecommendations.error || 
              contextualQuestions.error || streamingInterview.error || 
              performanceEvaluation.error
  };
}