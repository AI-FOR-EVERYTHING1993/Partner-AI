const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testBedrockAPIs() {
  console.log('🧪 Testing Bedrock APIs without authentication\n');

  const baseUrl = 'http://localhost:3000';

  // Test 1: Resume Analysis API
  console.log('📄 Testing Resume Analysis API...');
  try {
    const resumeText = `
John Smith
Software Engineer
5 years experience with JavaScript, React, Node.js, Python, AWS
Built scalable web applications, led team of 3 developers
Experience with microservices, Docker, Kubernetes
    `;

    // Create a simple FormData-like object for testing
    const formData = new FormData();
    const blob = new Blob([resumeText], { type: 'text/plain' });
    formData.append('file', blob, 'resume.txt');

    const response = await fetch(`${baseUrl}/api/analyze-resume`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resume Analysis - SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2).substring(0, 300) + '...\n');
    } else {
      console.log('❌ Resume Analysis - FAILED');
      console.log('Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Resume Analysis - ERROR:', error.message);
  }

  // Test 2: Interview Chat API
  console.log('💬 Testing Interview Chat API...');
  try {
    const response = await fetch(`${baseUrl}/api/interview-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "I have 5 years of experience with React and Node.js",
        interviewContext: {
          role: "Full Stack Developer",
          level: "Senior",
          techstack: ["React", "Node.js", "JavaScript"]
        },
        userId: "test-user"
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Interview Chat - SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2).substring(0, 300) + '...\n');
    } else {
      console.log('❌ Interview Chat - FAILED');
      console.log('Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Interview Chat - ERROR:', error.message);
  }

  // Test 3: Generate Questions API
  console.log('❓ Testing Generate Questions API...');
  try {
    const response = await fetch(`${baseUrl}/api/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: "Frontend Developer",
        level: "Mid-level",
        techStack: ["React", "JavaScript", "CSS"]
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Generate Questions - SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2).substring(0, 300) + '...\n');
    } else {
      console.log('❌ Generate Questions - FAILED');
      console.log('Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Generate Questions - ERROR:', error.message);
  }

  // Test 4: Enterprise Health Check
  console.log('🏥 Testing Enterprise Health API...');
  try {
    const response = await fetch(`${baseUrl}/api/enterprise/health`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Enterprise Health - SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2).substring(0, 300) + '...\n');
    } else {
      console.log('❌ Enterprise Health - FAILED');
      console.log('Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Enterprise Health - ERROR:', error.message);
  }

  console.log('🎉 Bedrock API Test Complete!');
}

// Only run if server is running
console.log('Make sure your Next.js server is running on port 3000');
console.log('Run: npm run dev\n');

testBedrockAPIs().catch(console.error);