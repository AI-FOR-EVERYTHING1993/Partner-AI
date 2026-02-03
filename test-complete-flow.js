const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config({ path: '.env.local' });

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testCompleteFlow() {
  console.log("🚀 Testing Complete 4-Step AI Interview Flow\n");

  // Step 1: Resume Analysis (Nova Pro)
  console.log("📄 STEP 1: Resume Analysis with Nova Pro");
  try {
    const resumePayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Analyze this resume and recommend interview categories:

RESUME:
John Smith
Software Engineer
5 years experience with JavaScript, React, Node.js, Python, AWS
Built scalable web applications, led team of 3 developers
Experience with microservices, Docker, Kubernetes

Provide JSON response with:
- overallScore (1-100)
- detectedRole
- experienceLevel
- recommendedInterviews (top 3 categories)
- strengths (3 items)
- improvements (3 items)`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.3
      }
    };

    const resumeCommand = new InvokeModelCommand({
      modelId: "amazon.nova-pro-v1:0",
      body: JSON.stringify(resumePayload),
      contentType: "application/json"
    });

    const resumeResponse = await client.send(resumeCommand);
    const resumeResult = JSON.parse(new TextDecoder().decode(resumeResponse.body));
    console.log("✅ Resume Analysis SUCCESS");
    console.log("Response:", resumeResult.output.message.content[0].text.substring(0, 300) + "...\n");

  } catch (error) {
    console.log("❌ Resume Analysis FAILED:", error.message);
  }

  // Step 2: Interview Question Generation (Nova Micro)
  console.log("❓ STEP 2: Interview Questions with Nova Micro");
  try {
    const questionsPayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: "Generate 3 interview questions for a Senior Full Stack Developer position focusing on React, Node.js, and AWS. Include 2 technical and 1 behavioral question."
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.7
      }
    };

    const questionsCommand = new InvokeModelCommand({
      modelId: "amazon.nova-micro-v1:0",
      body: JSON.stringify(questionsPayload),
      contentType: "application/json"
    });

    const questionsResponse = await client.send(questionsCommand);
    const questionsResult = JSON.parse(new TextDecoder().decode(questionsResponse.body));
    console.log("✅ Question Generation SUCCESS");
    console.log("Response:", questionsResult.output.message.content[0].text.substring(0, 200) + "...\n");

  } catch (error) {
    console.log("❌ Question Generation FAILED:", error.message);
  }

  // Step 3: Interview Conversation (Nova Lite)
  console.log("💬 STEP 3: Interview Conversation with Nova Lite");
  try {
    const interviewPayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: `You are interviewing a candidate for Senior Full Stack Developer. 
              
User said: "I have 5 years of experience building React applications with Node.js backends. I've worked with AWS services like Lambda, S3, and RDS to deploy scalable applications."

Provide a follow-up question as an interviewer. Keep it conversational and under 100 words.`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 200,
        temperature: 0.8
      }
    };

    const interviewCommand = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      body: JSON.stringify(interviewPayload),
      contentType: "application/json"
    });

    const interviewResponse = await client.send(interviewCommand);
    const interviewResult = JSON.parse(new TextDecoder().decode(interviewResponse.body));
    console.log("✅ Interview Conversation SUCCESS");
    console.log("Response:", interviewResult.output.message.content[0].text + "\n");

  } catch (error) {
    console.log("❌ Interview Conversation FAILED:", error.message);
  }

  // Step 4: Performance Analysis (Nova Pro for comprehensive feedback)
  console.log("📊 STEP 4: Performance Analysis with Nova Pro");
  try {
    const feedbackPayload = {
      messages: [
        {
          role: "user",
          content: [
            {
              text: `Analyze this interview performance and provide comprehensive feedback:

INTERVIEW CONTEXT:
- Role: Senior Full Stack Developer
- Level: Senior (5+ years)
- Tech Stack: React, Node.js, AWS

TRANSCRIPT:
Interviewer: "Tell me about your experience with React."
Candidate: "I have 5 years of experience building React applications. I've worked with hooks, context API, and state management libraries like Redux."

Interviewer: "How do you handle state management in large applications?"
Candidate: "I use Redux for complex state and React Context for simpler state. I also implement proper component architecture with custom hooks."

RESUME ANALYSIS:
- Overall Score: 85/100
- Detected Role: Full Stack Developer
- Experience Level: Senior
- Strengths: Strong technical skills, leadership experience

Provide JSON feedback with:
- overallScore (1-100)
- performance breakdown (technical, communication, confidence)
- strengths (3 items)
- improvements (3 items)
- resumeAlignment score
- nextSteps (3 items)`
            }
          ]
        }
      ],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.6
      }
    };

    const feedbackCommand = new InvokeModelCommand({
      modelId: "amazon.nova-pro-v1:0",
      body: JSON.stringify(feedbackPayload),
      contentType: "application/json"
    });

    const feedbackResponse = await client.send(feedbackCommand);
    const feedbackResult = JSON.parse(new TextDecoder().decode(feedbackResponse.body));
    console.log("✅ Performance Analysis SUCCESS");
    console.log("Response:", feedbackResult.output.message.content[0].text.substring(0, 400) + "...\n");

  } catch (error) {
    console.log("❌ Performance Analysis FAILED:", error.message);
  }

  console.log("🎉 Complete Flow Test Finished!");
}

testCompleteFlow().catch(console.error);