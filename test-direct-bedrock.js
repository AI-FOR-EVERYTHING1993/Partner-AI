const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config({ path: '.env.local' });

async function testDirectBedrock() {
  console.log('🧪 Testing Direct Bedrock Call for Resume Analysis\n');

  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const resumeText = "John Smith\nSoftware Engineer\n5 years JavaScript, React, Node.js experience";
  
  const payload = {
    messages: [
      {
        role: "user",
        content: [
          {
            text: `Analyze this resume and provide JSON output:

${resumeText}

Provide analysis in this exact JSON format:
{
  "overallScore": 85,
  "atsCompatibility": 80,
  "detectedRole": "Software Engineer",
  "experienceLevel": "mid",
  "strengths": ["Strong technical skills", "Relevant experience"],
  "improvements": ["Add quantified achievements", "Include more skills"],
  "recommendedInterviews": [
    {"category": "fullstack", "name": "Full Stack Developer", "match": 90}
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

  try {
    console.log('📤 Sending request to Nova Pro...');
    
    const command = new InvokeModelCommand({
      modelId: "amazon.nova-pro-v1:0",
      body: JSON.stringify(payload),
      contentType: "application/json"
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ SUCCESS - Nova Pro Response:');
    console.log('Raw response:', JSON.stringify(result, null, 2));
    
    if (result.output?.message?.content?.[0]?.text) {
      console.log('\n📄 Content:');
      console.log(result.output.message.content[0].text);
    }
    
  } catch (error) {
    console.log('❌ FAILED - Error:', error.message);
    console.log('Error details:', error);
  }
}

testDirectBedrock().catch(console.error);