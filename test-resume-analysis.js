const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function testResumeAnalysis() {
  console.log('🧪 Testing Resume Analysis API\n');

  // Create a test PDF content (simple text for testing)
  const resumeText = `
John Smith
Software Engineer
Email: john.smith@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Full Stack Developer | TechCorp | 2020-2024
- Built scalable web applications using React, Node.js, and AWS
- Led a team of 3 developers on microservices architecture
- Implemented CI/CD pipelines using Docker and Kubernetes
- Reduced application load time by 40% through optimization

Frontend Developer | StartupXYZ | 2018-2020
- Developed responsive web applications using React and TypeScript
- Collaborated with UX/UI designers to implement pixel-perfect designs
- Integrated RESTful APIs and GraphQL endpoints
- Mentored junior developers on best practices

SKILLS
Frontend: React, JavaScript, TypeScript, HTML5, CSS3, Vue.js
Backend: Node.js, Python, Express.js, MongoDB, PostgreSQL
Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
Tools: Git, Jenkins, Webpack, Jest, Cypress

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014-2018
  `;

  try {
    // Test 1: Direct API call with text (simulating PDF content)
    console.log('📄 Testing with direct text content...');
    
    const response = await fetch('http://localhost:3000/api/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: resumeText,
        category: 'fullstack'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resume Analysis - SUCCESS');
      console.log('Analysis Result:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Resume Analysis - FAILED');
      console.log('Status:', response.status, response.statusText);
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.log('❌ Resume Analysis - ERROR:', error.message);
  }

  // Test 2: Test the enterprise model service directly
  console.log('\n🔧 Testing Enterprise Model Service directly...');
  try {
    // Import the service (this will only work if we're in the Next.js context)
    const { enterpriseModelService } = require('./lib/enterprise');
    
    const directResult = await enterpriseModelService.analyzeResume(resumeText, 'fullstack');
    console.log('✅ Direct Model Service - SUCCESS');
    console.log('Direct Result:');
    console.log(JSON.stringify(directResult, null, 2));
    
  } catch (error) {
    console.log('❌ Direct Model Service - ERROR:', error.message);
    console.log('This is expected if running outside Next.js context');
  }
}

console.log('🚀 Make sure your Next.js server is running on port 3000');
console.log('Run: npm run dev\n');

testResumeAnalysis().catch(console.error);