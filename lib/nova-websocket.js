const { WebSocketServer } = require('ws');
const { BedrockRuntimeClient, InvokeModelWithBidirectionalStreamCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const wss = new WebSocketServer({ port: 8081 });

class NovaWebSocketHandler {
  constructor() {
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async handleConnection(ws) {
    console.log('Client connected');
    let novaStream = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'start_session':
            novaStream = await this.startNovaSession(data.interviewData);
            this.handleNovaResponses(novaStream, ws);
            ws.send(JSON.stringify({ type: 'session_started', sessionId: data.sessionId }));
            
            // Send initial AI greeting
            setTimeout(() => {
              const openingMessage = `Hello! I'm excited to interview you for the ${data.interviewData.role} position today. Let's start with an easy one - could you tell me a bit about yourself and what drew you to ${data.interviewData.role}?`;
              ws.send(JSON.stringify({
                type: 'text_output',
                text: openingMessage
              }));
            }, 1000);
            break;
            
          case 'audio_input':
            if (novaStream) {
              await this.sendAudioToNova(novaStream, data.audioData);
            }
            break;
            
          case 'text_input':
            if (novaStream) {
              await this.sendTextToNova(novaStream, data.text);
            }
            break;
            
          case 'end_session':
            if (novaStream) {
              await novaStream.inputStream.end();
              novaStream = null;
            }
            ws.send(JSON.stringify({ type: 'session_ended' }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      if (novaStream) {
        novaStream.inputStream.end();
      }
    });
  }

  async startNovaSession(interviewData) {
    const systemPrompt = `You are an AI interviewer conducting a ${interviewData.role} interview at ${interviewData.level} level. Focus on: ${interviewData.techstack.join(', ')}. 

IMPORTANT: You MUST start the conversation immediately with a warm greeting and your first interview question. Do not wait for the user to speak first.

Your opening should be: "Hello! I'm excited to interview you for the ${interviewData.role} position today. Let's start with an easy one - could you tell me a bit about yourself and what drew you to ${interviewData.role}?"

After that, keep responses conversational and under 50 words. Ask one question at a time. Be encouraging and professional.`;

    const command = new InvokeModelWithBidirectionalStreamCommand({
      modelId: process.env.NOVA_SONIC_MODEL_ID || 'amazon.nova-2-sonic-v1:0'
    });

    const stream = await this.bedrockClient.send(command);
    
    // Send initial system prompt
    await stream.inputStream.write({
      systemPrompt: { text: systemPrompt }
    });

    // Send initial trigger to make AI speak first
    setTimeout(async () => {
      await stream.inputStream.write({
        textInput: { text: "BEGIN_INTERVIEW" }
      });
    }, 500);

    return stream;
  }

  async sendAudioToNova(stream, audioData) {
    await stream.inputStream.write({
      audioInput: {
        audio: audioData,
        contentType: 'audio/pcm'
      }
    });
  }

  async sendTextToNova(stream, text) {
    await stream.inputStream.write({
      textInput: { text }
    });
  }

  async handleNovaResponses(stream, ws) {
    try {
      for await (const event of stream.outputStream) {
        if (event.audioOutput) {
          ws.send(JSON.stringify({
            type: 'audio_output',
            audio: event.audioOutput.audio,
            contentType: event.audioOutput.contentType
          }));
        }
        
        if (event.textOutput) {
          ws.send(JSON.stringify({
            type: 'text_output',
            text: event.textOutput.text
          }));
        }
      }
    } catch (error) {
      console.error('Nova response error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Nova stream error' }));
    }
  }
}

const handler = new NovaWebSocketHandler();

wss.on('connection', (ws) => {
  handler.handleConnection(ws);
});

console.log('Nova WebSocket server running on port 8081');

module.exports = wss;