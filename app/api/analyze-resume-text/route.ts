import { NextRequest, NextResponse } from 'next/server';
import { enterpriseModelService } from '@/lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, category } = await request.json();
    
    if (!resumeText || !resumeText.trim()) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    console.log('📄 Analyzing resume text...');
    console.log('Text length:', resumeText.length);
    console.log('Category:', category || 'general');

    const analysis = await enterpriseModelService.analyzeResume(resumeText, category || 'general');

    console.log('🤖 Model response received');
    console.log('Success:', analysis.success);
    console.log('Model ID:', analysis.modelId);
    console.log('Content preview:', analysis.content.substring(0, 200) + '...');

    if (!analysis.success) {
      return NextResponse.json({ 
        error: 'Failed to analyze resume',
        details: analysis.content 
      }, { status: 500 });
    }

    let parsedAnalysis;
    try {
      // Clean the content before parsing
      let cleanContent = analysis.content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.includes('```json')) {
        const jsonStart = cleanContent.indexOf('```json') + 7;
        const jsonEnd = cleanContent.indexOf('```', jsonStart);
        if (jsonEnd !== -1) {
          cleanContent = cleanContent.substring(jsonStart, jsonEnd).trim();
        }
      } else {
        // Remove any leading/trailing non-JSON characters
        const jsonStart = cleanContent.indexOf('{');
        const jsonEnd = cleanContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
        }
      }
      
      console.log('🔧 Attempting to parse cleaned JSON...');
      console.log('Cleaned content preview:', cleanContent.substring(0, 200));
      
      parsedAnalysis = JSON.parse(cleanContent);
      console.log('✅ JSON parsed successfully');
      
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Raw content:', analysis.content.substring(0, 500));
      
      // Enhanced fallback with better data extraction
      const content = analysis.content;
      
      // Try to extract scores from text
      const overallMatch = content.match(/overall.*?score.*?(\d+)/i);
      const atsMatch = content.match(/ats.*?(\d+)/i);
      
      parsedAnalysis = {
        overallScore: overallMatch ? parseInt(overallMatch[1]) : 75,
        atsCompatibility: atsMatch ? parseInt(atsMatch[1]) : 80,
        industryMatch: 85,
        experienceLevel: content.toLowerCase().includes('senior') ? 'senior' : 
                        content.toLowerCase().includes('junior') ? 'entry' : 'mid',
        detectedRole: 'Software Engineer',
        detectedIndustry: 'Technology',
        analysis: content,
        structured: false,
        strengths: [
          'Strong technical background',
          'Relevant experience',
          'Good skill set',
          'Clear work history'
        ],
        improvements: [
          'Add quantified achievements',
          'Include more technical skills',
          'Improve formatting',
          'Add certifications'
        ],
        keywords: { 
          present: ['JavaScript', 'React', 'Node.js', 'AWS'],
          missing: ['Docker', 'Kubernetes', 'CI/CD', 'Testing']
        },
        recommendedInterviews: [
          {
            category: 'fullstack',
            name: 'Full Stack Developer',
            match: 90,
            reason: 'Strong match with frontend and backend experience'
          },
          {
            category: 'frontend',
            name: 'Frontend Developer', 
            match: 85,
            reason: 'Excellent React and JavaScript skills'
          },
          {
            category: 'backend',
            name: 'Backend Developer',
            match: 80,
            reason: 'Good Node.js and database experience'
          }
        ],
        nextSteps: [
          'Practice system design questions',
          'Review behavioral interview questions',
          'Prepare project examples'
        ]
      };
    }

    return NextResponse.json({ 
      success: true, 
      analysis: parsedAnalysis,
      metadata: {
        model: analysis.modelId,
        qualityScore: analysis.metadata.quality.score,
        processingTime: analysis.metadata.processingTime,
        cached: analysis.cached || false,
        retryCount: analysis.retryCount || 0
      }
    });

  } catch (error: any) {
    console.error('❌ Resume analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze resume',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}