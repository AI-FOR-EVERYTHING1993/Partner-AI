const fetch = require('node-fetch');

async function testResumeAnalysis() {
  console.log('🧪 Testing Resume Analysis Fix\n');

  const sampleResume = `John Smith
Senior Full Stack Developer
Email: john.smith@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Full Stack Developer | TechCorp | 2020-2024
- Built scalable web applications using React, Node.js, and AWS
- Led a team of 3 developers on microservices architecture
- Implemented CI/CD pipelines using Docker and Kubernetes
- Reduced application load time by 40% through optimization
- Managed PostgreSQL databases and Redis caching

Software Engineer | StartupXYZ | 2018-2020
- Developed frontend applications with React and TypeScript
- Created RESTful APIs using Node.js and Express
- Worked with MongoDB and implemented GraphQL endpoints
- Collaborated in Agile/Scrum development environment

SKILLS
Frontend: React, JavaScript, TypeScript, HTML5, CSS3, Redux
Backend: Node.js, Python, Express.js, MongoDB, PostgreSQL, Redis
Cloud: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
Tools: Git, Jenkins, Jest, Webpack, Babel

EDUCATION
Bachelor of Science in Computer Science | University of Tech | 2018`;

  try {
    console.log('📤 Sending resume for analysis...');
    
    const response = await fetch('http://localhost:3000/api/analyze-resume-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: sampleResume,
        category: 'general'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ RESUME ANALYSIS WORKING!');
      console.log('\n📊 Analysis Results:');
      console.log('- Overall Score:', result.analysis.overallScore);
      console.log('- Experience Level:', result.analysis.experienceLevel);
      console.log('- Detected Role:', result.analysis.detectedRole);
      console.log('- ATS Compatibility:', result.analysis.atsCompatibility);
      
      console.log('\n💪 Top Strengths:');
      result.analysis.strengths.slice(0, 3).forEach((strength, i) => {
        console.log(`  ${i + 1}. ${strength}`);
      });
      
      console.log('\n🎯 Recommended Interviews:');
      result.analysis.recommendedInterviews.slice(0, 3).forEach((interview, i) => {
        console.log(`  ${i + 1}. ${interview.name} (${interview.match}% match)`);
        console.log(`     Reason: ${interview.reason}`);
      });
      
      console.log('\n⚡ Performance:');
      console.log('- Model:', result.metadata.model);
      console.log('- Processing Time:', result.metadata.processingTime + 'ms');
      console.log('- Quality Score:', result.metadata.qualityScore);
      
      console.log('\n🎉 RESUME ANALYSIS IS FIXED AND WORKING!');
      
    } else {
      console.log('❌ RESUME ANALYSIS FAILED');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
      console.log('Details:', result.details);
      
      if (result.suggestion) {
        console.log('💡 Suggestion:', result.suggestion);
      }
    }

  } catch (error) {
    console.log('❌ TEST FAILED');
    console.log('Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Development server is running (npm run dev)');
    console.log('2. Bedrock credentials are configured');
    console.log('3. Models are accessible');
  }
}

testResumeAnalysis().catch(console.error);