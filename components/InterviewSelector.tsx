"use client"

import React, { useState } from "react";
import { TECHNICAL_INTERVIEWS, NON_TECHNICAL_INTERVIEWS, EXPERIENCE_LEVELS, COMPANY_TYPES } from "@/constants/interviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Sparkles } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

interface InterviewSelection {
  category: string;
  type: 'technical' | 'non-technical';
  experienceLevel: string;
  companyType: string;
}

interface ResumeAnalysis {
  suggestedCategory: string;
  suggestedLevel: string;
  extractedSkills: string[];
  recommendations: string[];
  confidence: number;
}

const InterviewSelector = () => {
  const [selection, setSelection] = useState<InterviewSelection>({
    category: '',
    type: 'technical',
    experienceLevel: '',
    companyType: ''
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [useAIRecommendations, setUseAIRecommendations] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    
    if (!file) return;
    
    // File validation
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file only.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadError('File size must be less than 5MB.');
      return;
    }
    
    setResumeFile(file);
    await analyzeResume(file);
  };

  const analyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    setUploadError('');
    
    try {
      // Simulate PDF analysis with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock analysis based on filename or random selection
      const mockAnalyses = [
        {
          suggestedCategory: 'frontend',
          suggestedLevel: 'mid',
          extractedSkills: ['React', 'JavaScript', 'CSS', 'Node.js'],
          recommendations: [
            'Add more quantified achievements',
            'Include leadership experience',
            'Highlight problem-solving skills'
          ],
          confidence: 92
        },
        {
          suggestedCategory: 'backend',
          suggestedLevel: 'senior',
          extractedSkills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
          recommendations: [
            'Emphasize system design experience',
            'Add cloud architecture projects',
            'Include team mentoring examples'
          ],
          confidence: 88
        },
        {
          suggestedCategory: 'data-science',
          suggestedLevel: 'mid',
          extractedSkills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
          recommendations: [
            'Add more ML project outcomes',
            'Include data visualization skills',
            'Highlight statistical analysis experience'
          ],
          confidence: 85
        },
        {
          suggestedCategory: 'product-manager',
          suggestedLevel: 'senior',
          extractedSkills: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
          recommendations: [
            'Quantify product impact metrics',
            'Add cross-functional collaboration examples',
            'Include user research experience'
          ],
          confidence: 90
        }
      ];
      
      // Select random analysis or based on filename
      const randomAnalysis = mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
      
      // Auto-apply AI recommendations after analysis
      setResumeAnalysis(randomAnalysis);
      
      // Auto-select the recommended options
      const suggestedType = TECHNICAL_INTERVIEWS.find(t => t.id === randomAnalysis.suggestedCategory) ? 'technical' : 'non-technical';
      setSelection({
        category: randomAnalysis.suggestedCategory,
        type: suggestedType,
        experienceLevel: randomAnalysis.suggestedLevel,
        companyType: 'startup' // Default company type
      });
      setUseAIRecommendations(true);
      
      // Store analysis for resume results page
      const resumeResults = {
        overallScore: 85,
        atsScore: 78,
        industryMatch: "Technology",
        experienceLevel: "Mid-Level",
        strengths: [
          "Strong technical skills with modern frameworks",
          "Quantified achievements showing business impact",
          "Clear career progression",
          "ATS-friendly formatting"
        ],
        improvements: randomAnalysis.recommendations,
        keywordOptimization: {
          missing: ["Agile", "CI/CD", "Cloud Architecture"],
          present: randomAnalysis.extractedSkills,
          suggestions: ["Add cloud technologies", "Include DevOps experience"]
        },
        industryInsights: {
          topSkills: ["React", "AWS", "Docker", "Kubernetes"],
          emergingTrends: ["AI/ML", "Cloud Native", "Microservices"],
          salaryRange: "$80k - $120k",
          demandLevel: "High"
        },
        recruiterTips: ["Quantify achievements", "Use action verbs"],
        nextSteps: ["Update skills section", "Add portfolio links"]
      };
      
      // Don't redirect to resume-results, stay on this page
      // sessionStorage.setItem('resumeAnalysis', JSON.stringify(resumeResults));
      
    } catch (error) {
      setUploadError('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetSelections = () => {
    setSelection({
      category: '',
      type: 'technical',
      experienceLevel: '',
      companyType: ''
    });
    setResumeFile(null);
    setResumeAnalysis(null);
    setUseAIRecommendations(false);
    setUploadError('');
  };

  const applyAIRecommendations = () => {
    if (resumeAnalysis) {
      const suggestedType = TECHNICAL_INTERVIEWS.find(t => t.id === resumeAnalysis.suggestedCategory) ? 'technical' : 'non-technical';
      setSelection({
        ...selection,
        category: resumeAnalysis.suggestedCategory,
        type: suggestedType,
        experienceLevel: resumeAnalysis.suggestedLevel
      });
      setUseAIRecommendations(true);
    }
  };

  const handleStartInterview = () => {
    if (selection.category && selection.experienceLevel && selection.companyType) {
      const params = new URLSearchParams({
        category: selection.category,
        level: selection.experienceLevel,
        company: selection.companyType,
        type: selection.type,
        ...(resumeAnalysis && { 
          aiAnalyzed: 'true',
          skills: resumeAnalysis.extractedSkills.join(',') 
        })
      });
      window.location.href = `/interview?${params.toString()}`;
    }
  };

  const isComplete = selection.category && selection.experienceLevel && selection.companyType;
  const allInterviews = [...TECHNICAL_INTERVIEWS, ...NON_TECHNICAL_INTERVIEWS];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-sky-100 rounded-3xl m-4">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">Choose Your Interview</h1>
        <p className="text-blue-700 font-semibold">Upload your resume for AI-powered recommendations, or select manually</p>
        
        {/* Reset Button */}
        {(resumeFile || selection.category || selection.experienceLevel || selection.companyType) && (
          <Button 
            onClick={resetSelections}
            variant="outline"
            className="mt-4 text-gray-600 hover:text-gray-800"
          >
            🔄 Reset All Selections
          </Button>
        )}
      </div>

      {/* Resume Upload Section */}
      <Card className="border-2 border-dashed border-blue-700 bg-gradient-to-br from-blue-800 to-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <Sparkles className="w-5 h-5 text-blue-300" />
            AI-Powered Resume Analysis
          </CardTitle>
          <CardDescription className="text-blue-200">
            Upload your resume to get personalized interview recommendations and improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Error Message */}
            {uploadError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                ⚠️ {uploadError}
              </div>
            )}
            
            <div className="flex items-center justify-center w-full">
              <Label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {resumeFile ? (
                    <>
                      <FileText className="w-8 h-8 mb-2 text-green-500" />
                      <p className="text-sm text-gray-500">{resumeFile.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">Click to upload your resume</p>
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </>
                  )}
                </div>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Label>
            </div>
            
            {isAnalyzing && (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 font-medium">Analyzing your resume with AI...</p>
                <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
              </div>
            )}
            
            {resumeAnalysis && (
              <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-green-400">✨ AI Analysis Complete</h3>
                  <span className="text-sm text-gray-400">{resumeAnalysis.confidence}% confidence</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-white">Recommended Interview:</h4>
                    <p className="text-sm text-blue-400">
                      {allInterviews.find(i => i.id === resumeAnalysis.suggestedCategory)?.name} - {EXPERIENCE_LEVELS.find(l => l.id === resumeAnalysis.suggestedLevel)?.name}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-white">Extracted Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {resumeAnalysis.extractedSkills.slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-white">Resume Improvement Suggestions:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {resumeAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={applyAIRecommendations}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={useAIRecommendations}
                  >
                    {useAIRecommendations ? '✓ AI Recommendations Applied' : 'Apply AI Recommendations'}
                  </Button>
                  <Button 
                    onClick={() => {
                      sessionStorage.setItem('resumeAnalysis', JSON.stringify({
                        overallScore: 85,
                        atsScore: 78,
                        industryMatch: "Technology",
                        experienceLevel: "Mid-Level",
                        strengths: ["Strong technical skills", "Clear project descriptions"],
                        improvements: resumeAnalysis.recommendations,
                        keywordOptimization: {
                          missing: ["Agile", "CI/CD"],
                          present: resumeAnalysis.extractedSkills,
                          suggestions: ["Add cloud technologies"]
                        }
                      }));
                      window.location.href = '/resume-results';
                    }}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    View Full Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview Type Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-600">
          <button
            onClick={() => setSelection({...selection, type: 'technical', category: ''})}
            className={`px-8 py-3 rounded-md transition-all font-semibold ${
              selection.type === 'technical' 
                ? 'bg-blue-600 shadow-lg text-white transform scale-105' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Technical
          </button>
          <button
            onClick={() => setSelection({...selection, type: 'non-technical', category: ''})}
            className={`px-8 py-3 rounded-md transition-all font-semibold ${
              selection.type === 'non-technical' 
                ? 'bg-blue-600 shadow-lg text-white transform scale-105' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Non-Technical
          </button>
        </div>
      </div>

      {/* Interview Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Interview Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(selection.type === 'technical' ? TECHNICAL_INTERVIEWS : NON_TECHNICAL_INTERVIEWS).map((interview) => (
            <Card 
              key={interview.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selection.category === interview.id 
                  ? 'ring-2 ring-blue-500 bg-gray-800 border-blue-500' 
                  : 'hover:border-gray-600 bg-gray-800/50'
              }`}
              onClick={() => setSelection({...selection, category: interview.id})}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${
                  selection.category === interview.id ? 'text-blue-300' : 'text-white'
                }`}>
                  {selection.category === interview.id && '✓ '}{interview.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={selection.category === interview.id ? 'text-blue-200' : 'text-gray-400'}>
                  {interview.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Experience Level</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXPERIENCE_LEVELS.map((level) => (
            <Card 
              key={level.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selection.experienceLevel === level.id 
                  ? 'ring-2 ring-blue-500 bg-gray-800 border-blue-500' 
                  : 'hover:border-gray-600 bg-gray-800/50'
              }`}
              onClick={() => setSelection({...selection, experienceLevel: level.id})}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${
                  selection.experienceLevel === level.id ? 'text-blue-300' : 'text-white'
                }`}>
                  {selection.experienceLevel === level.id && '✓ '}{level.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={selection.experienceLevel === level.id ? 'text-blue-200' : 'text-gray-400'}>
                  {level.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Company Type */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Company Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPANY_TYPES.map((company) => (
            <Card 
              key={company.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selection.companyType === company.id 
                  ? 'ring-2 ring-blue-500 bg-gray-800 border-blue-500' 
                  : 'hover:border-gray-600 bg-gray-800/50'
              }`}
              onClick={() => setSelection({...selection, companyType: company.id})}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg ${
                  selection.companyType === company.id ? 'text-blue-300' : 'text-white'
                }`}>
                  {selection.companyType === company.id && '✓ '}{company.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={selection.companyType === company.id ? 'text-blue-200' : 'text-gray-400'}>
                  {company.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Start Interview Button */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={handleStartInterview}
          disabled={!isComplete}
          className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white shadow-lg transform transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isComplete ? 'Start Interview →' : 'Complete Selection to Start'}
        </Button>
      </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default InterviewSelector;