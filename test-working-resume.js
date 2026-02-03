const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config({ path: '.env.local' });

async function testWorkingResume() {
  console.log('🎯 Testing Complete Resume Analysis Flow\n');

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const resumeText = `John Smith
Senior Software Engineer
Email: john.smith@email.com

EXPERIENCE
Senior Full Stack Developer | TechCorp | 2020-2024
- Built scalable web applications using React, Node.js, and AWS
- Led a team of 3 developers on microservices architecture
- Implemented CI/CD pipelines using Docker and Kubernetes
- Reduced application load time by 40% through optimization

SKILLS
Frontend: React, JavaScript, TypeScript, HTML5, CSS3
Backend: Node.js, Python, Express.js, MongoDB, PostgreSQL
Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes`;

  // Step 1: Resume Analysis
  console.log('📄 STEP 1: Resume Analysis with Nova Pro');
  try {
    const resumePayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Analyze this resume and provide structured JSON output with interview recommendations:

${resumeText}

Provide analysis in this exact JSON format:
{
  "overallScore": 85,
  "atsCompatibility": 80,
  "industryMatch": 90,
  "experienceLevel": "senior",
  "detectedRole": "Full Stack Developer",
  "detectedIndustry": "Technology",
  "strengths": [
    "Strong technical leadership",
    "Proven scalability experience",
    "Modern tech stack proficiency",
    "Quantified achievements"
  ],
  "improvements": [
    "Add more certifications",
    "Include soft skills",
    "Expand on methodologies"
  ],
  "keywords": {
    "present": ["React", "Node.js", "AWS", "Docker", "Kubernetes"],
    "missing": ["GraphQL", "Microservices", "Testing", "Agile"]
  },
  "recommendedInterviews": [
    {
      "category": "fullstack",
      "name": "Senior Full Stack Developer",
      "match": 95,
      "reason": "Perfect match with React, Node.js, and AWS experience"
    },
    {
      "category": "devops",
      "name": "DevOps Engineer",
      "match": 85,
      "reason": "Strong Docker, Kubernetes, and CI/CD experience"
    },
    {
      "category": "engineering-manager",
      "name": "Engineering Manager",
      "match": 80,
      "reason": "Leadership experience with team of 3 developers"
    }
  ],
  "nextSteps": [
    "Practice system design questions",
    "Prepare leadership examples",
    "Review AWS architecture patterns"
  ]
}`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.3,
        topP: 0.9
      }
    };

    const resumeCommand = new InvokeModelCommand({
      modelId: "amazon.nova-pro-v1:0",
      body: JSON.stringify(resumePayload),
      contentType: "application/json"
    });

    const resumeResponse = await client.send(resumeCommand);
    const resumeResult = JSON.parse(new TextDecoder().decode(resumeResponse.body));
    
    console.log('✅ Resume Analysis SUCCESS');
    
    // Extract and parse JSON
    let analysisData;
    const content = resumeResult.output.message.content[0].text;
    
    if (content.includes('```json')) {
      const jsonStart = content.indexOf('```json') + 7;
      const jsonEnd = content.indexOf('```', jsonStart);
      const jsonContent = content.substring(jsonStart, jsonEnd).trim();
      analysisData = JSON.parse(jsonContent);
    } else {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      const jsonContent = content.substring(jsonStart, jsonEnd + 1);
      analysisData = JSON.parse(jsonContent);
    }
    
    console.log('📊 Analysis Results:');
    console.log('- Overall Score:', analysisData.overallScore);
    console.log('- Experience Level:', analysisData.experienceLevel);
    console.log('- Detected Role:', analysisData.detectedRole);
    console.log('- Top Recommended Interview:', analysisData.recommendedInterviews[0].name);
    console.log('- Match Score:', analysisData.recommendedInterviews[0].match + '%');
    
    // Step 2: Interview Simulation
    console.log('\n💬 STEP 2: Interview Simulation with Nova Lite');
    
    const interviewPayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: `You are interviewing a ${analysisData.detectedRole} candidate. Based on their resume showing ${analysisData.experienceLevel} level experience with ${analysisData.keywords.present.join(', ')}, start the interview.

Candidate says: "Hello, I'm excited to interview for the ${analysisData.recommendedInterviews[0].name} position. I have ${analysisData.experienceLevel} level experience and have been working with React and Node.js for several years."

Provide a professional interviewer response with a follow-up question. Keep it conversational and under 100 words.`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 200,
        temperature: 0.8,
        topP: 0.9
      }
    };

    const interviewCommand = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      body: JSON.stringify(interviewPayload),
      contentType: "application/json"
    });

    const interviewResponse = await client.send(interviewCommand);
    const interviewResult = JSON.parse(new TextDecoder().decode(interviewResponse.body));
    
    console.log('✅ Interview Simulation SUCCESS');
    console.log('🤖 AI Interviewer:', interviewResult.output.message.content[0].text);
    
    // Step 3: Performance Feedback
    console.log('\n📈 STEP 3: Performance Feedback with Nova Pro');
    
    const feedbackPayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Provide comprehensive interview feedback combining resume analysis and interview performance:

RESUME ANALYSIS:
- Overall Score: ${analysisData.overallScore}/100
- Experience Level: ${analysisData.experienceLevel}
- Role: ${analysisData.detectedRole}
- Strengths: ${analysisData.strengths.join(', ')}

INTERVIEW TRANSCRIPT:
Interviewer: "${interviewResult.output.message.content[0].text}"
Candidate: "I have extensive experience with React and Node.js. In my previous role at TechCorp, I led a team of 3 developers and built scalable applications that reduced load time by 40%. I'm particularly proud of implementing our CI/CD pipeline with Docker and Kubernetes."

Provide JSON feedback:
{
  "overallScore": 88,
  "performance": {
    "technical": 90,
    "communication": 85,
    "confidence": 88,
    "leadership": 92
  },
  "strengths": ["Strong technical examples", "Leadership experience", "Quantified achievements"],
  "improvements": ["Elaborate on challenges faced", "Discuss team dynamics", "Explain technical decisions"],
  "resumeAlignment": {
    "score": 95,
    "highlights": ["Experience matches perfectly", "Leadership skills evident"],
    "gaps": ["Could discuss soft skills more"]
  },
  "nextSteps": ["Practice behavioral questions", "Prepare system design examples", "Review leadership scenarios"]
}`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 1500,
        temperature: 0.6,
        topP: 0.9
      }
    };

    const feedbackCommand = new InvokeModelCommand({
      modelId: "amazon.nova-pro-v1:0",
      body: JSON.stringify(feedbackPayload),
      contentType: "application/json"
    });

    const feedbackResponse = await client.send(feedbackCommand);
    const feedbackResult = JSON.parse(new TextDecoder().decode(feedbackResponse.body));
    
    console.log('✅ Performance Feedback SUCCESS');
    
    // Extract feedback JSON
    const feedbackContent = feedbackResult.output.message.content[0].text;
    let feedbackData;
    
    if (feedbackContent.includes('```json')) {
      const jsonStart = feedbackContent.indexOf('```json') + 7;
      const jsonEnd = feedbackContent.indexOf('```', jsonStart);
      const jsonContent = feedbackContent.substring(jsonStart, jsonEnd).trim();
      feedbackData = JSON.parse(jsonContent);
    } else {
      const jsonStart = feedbackContent.indexOf('{');
      const jsonEnd = feedbackContent.lastIndexOf('}');
      const jsonContent = feedbackContent.substring(jsonStart, jsonEnd + 1);
      feedbackData = JSON.parse(jsonContent);
    }
    
    console.log('📊 Final Results:');
    console.log('- Interview Score:', feedbackData.overallScore + '/100');
    console.log('- Technical Performance:', feedbackData.performance.technical + '/100');
    console.log('- Communication:', feedbackData.performance.communication + '/100');
    console.log('- Resume Alignment:', feedbackData.resumeAlignment.score + '/100');
    console.log('- Top Strength:', feedbackData.strengths[0]);
    console.log('- Key Improvement:', feedbackData.improvements[0]);
    
    console.log('\n🎉 COMPLETE 4-STEP FLOW SUCCESSFUL! 🎉');
    console.log('\n✅ Your AI Interview Prep System is Working:');
    console.log('1. ✅ Resume Analysis (Nova Pro)');
    console.log('2. ✅ Interview Recommendations');
    console.log('3. ✅ AI Interview Simulation (Nova Lite)');
    console.log('4. ✅ Comprehensive Feedback (Nova Pro)');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testWorkingResume().catch(console.error);