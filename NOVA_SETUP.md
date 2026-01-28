# Nova Sonic Integration Setup

This integration brings real-time bidirectional audio streaming to your interview application using Amazon Nova Sonic.

## Prerequisites

1. **AWS Account** with Bedrock access
2. **AWS Credentials** configured
3. **Node.js** (v18 or higher)
4. **Modern browser** with WebAudio API support

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials in `.env.local`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
# OR use AWS_PROFILE for profile-based auth
AWS_PROFILE=your_profile_name
```

## Running the Application

### Option 1: Run both servers together
```bash
npm run dev:full
```

### Option 2: Run servers separately
Terminal 1 (Next.js app):
```bash
npm run dev
```

Terminal 2 (Nova Sonic WebSocket server):
```bash
npm run nova-server
```

## How It Works

1. **WebSocket Server** (port 3001) handles Nova Sonic bidirectional streaming
2. **Next.js App** (port 3000) serves the interview interface
3. **Real-time Audio** flows between browser ↔ WebSocket ↔ Nova Sonic

## Features

- **Real-time voice conversation** with AI interviewer
- **Bidirectional audio streaming** using Nova Sonic
- **WebSocket-based** low-latency communication
- **Interview context awareness** for relevant questions
- **Professional audio quality** with noise suppression

## Troubleshooting

### Connection Issues
- Ensure both servers are running
- Check AWS credentials are valid
- Verify microphone permissions in browser

### Audio Issues
- Grant microphone access when prompted
- Check browser compatibility (Chrome/Edge recommended)
- Ensure stable internet connection

### AWS Issues
- Verify Bedrock access in your AWS account
- Check Nova Sonic model availability in your region
- Confirm AWS credentials have proper permissions