#!/usr/bin/env node

const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function createVoiceInterviewDemo() {
  console.log('🎤 Creating Voice Interview Demo with Amazon Polly\n');
  
  const polly = new PollyClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const interviewScripts = [
    {
      file: 'welcome.mp3',
      text: 'Welcome to your AI interview preparation session. I will ask you technical questions and provide feedback on your responses.',
      voice: 'Joanna'
    },
    {
      file: 'react-question.mp3', 
      text: 'Here is your first question: Explain the difference between useState and useEffect hooks in React, and provide an example of when you would use each.',
      voice: 'Joanna'
    },
    {
      file: 'feedback-positive.mp3',
      text: 'Excellent answer! You demonstrated a clear understanding of React hooks and provided practical examples.',
      voice: 'Joanna'
    },
    {
      file: 'feedback-improvement.mp3',
      text: 'Good start, but try to be more specific about the use cases. Can you provide a concrete example?',
      voice: 'Joanna'
    },
    {
      file: 'next-question.mp3',
      text: 'Let me ask you about system design. How would you design a scalable chat application?',
      voice: 'Matthew'
    }
  ];

  console.log('🔊 Generating interview audio files...\n');

  for (const script of interviewScripts) {
    try {
      const command = new SynthesizeSpeechCommand({
        Text: script.text,
        OutputFormat: 'mp3',
        VoiceId: script.voice,
        Engine: 'neural'
      });

      const response = await polly.send(command);
      const audioBuffer = Buffer.from(await response.AudioStream.transformToByteArray());
      
      fs.writeFileSync(`audio/${script.file}`, audioBuffer);
      console.log(`✅ Created: audio/${script.file}`);
      
    } catch (error) {
      console.log(`❌ Failed to create ${script.file}: ${error.message}`);
    }
  }

  console.log('\n🎉 Voice interview demo ready!');
  console.log('\n📁 Audio files created in audio/ folder');
  console.log('🎯 Next: Request Nova model access for full AI responses');
  console.log('💡 Current: Voice works, just need text generation models');
}

// Create audio directory
if (!fs.existsSync('audio')) {
  fs.mkdirSync('audio');
}

createVoiceInterviewDemo().catch(console.error);