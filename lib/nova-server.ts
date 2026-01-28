import { createServer } from 'http';
import { Server } from 'socket.io';
import { fromIni } from "@aws-sdk/credential-providers";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { NovaSonicBidirectionalStreamClient, StreamSession } from './nova-client';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Create the AWS Bedrock client
const bedrockClient = new NovaSonicBidirectionalStreamClient({
  requestHandlerConfig: {
    maxConcurrentStreams: 10,
  },
  clientConfig: {
    region: process.env.AWS_REGION || "us-east-1",
    credentials: process.env.AWS_PROFILE ? fromIni({ profile: process.env.AWS_PROFILE }) : defaultProvider()
  }
});

// Track active sessions per socket
const socketSessions = new Map<string, StreamSession>();

// Session states
enum SessionState {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ACTIVE = 'active',
  CLOSED = 'closed'
}

const sessionStates = new Map<string, SessionState>();

// Helper function to create and initialize a new session
async function createNewSession(socket: any): Promise<StreamSession> {
  const sessionId = socket.id;

  try {
    console.log(`Creating new session for client: ${sessionId}`);
    sessionStates.set(sessionId, SessionState.INITIALIZING);

    // Create session
    const session = bedrockClient.createStreamSession(sessionId);

    // Set up event handlers
    setupSessionEventHandlers(session, socket);

    // Store the session
    socketSessions.set(sessionId, session);
    sessionStates.set(sessionId, SessionState.READY);

    console.log(`Session ${sessionId} created and ready`);
    return session;
  } catch (error) {
    console.error(`Error creating session for ${sessionId}:`, error);
    sessionStates.set(sessionId, SessionState.CLOSED);
    throw error;
  }
}

// Helper function to set up event handlers for a session
function setupSessionEventHandlers(session: StreamSession, socket: any) {
  session.onEvent('usageEvent', (data) => {
    socket.emit('usageEvent', data);
  });

  session.onEvent('completionStart', (data) => {
    socket.emit('completionStart', data);
  });

  session.onEvent('contentStart', (data) => {
    socket.emit('contentStart', data);
  });

  session.onEvent('textOutput', (data) => {
    console.log('Text output:', data);
    socket.emit('textOutput', data);
  });

  session.onEvent('audioOutput', (data) => {
    console.log('Audio output received, sending to client');
    socket.emit('audioOutput', data);
  });

  session.onEvent('error', (data) => {
    console.error('Error in session:', data);
    socket.emit('error', data);
  });

  session.onEvent('contentEnd', (data) => {
    console.log('Content end received: ', data);
    socket.emit('contentEnd', data);
  });

  session.onEvent('streamComplete', () => {
    console.log('Stream completed for client:', socket.id);
    socket.emit('streamComplete');
    sessionStates.set(socket.id, SessionState.CLOSED);
  });
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  sessionStates.set(socket.id, SessionState.CLOSED);

  // Handle session initialization request
  socket.on('initializeConnection', async (callback) => {
    try {
      const currentState = sessionStates.get(socket.id);
      console.log(`Initializing session for ${socket.id}, current state: ${currentState}`);
      
      if (currentState === SessionState.INITIALIZING || currentState === SessionState.READY || currentState === SessionState.ACTIVE) {
        console.log(`Session already exists for ${socket.id}, state: ${currentState}`);
        if (callback) callback({ success: true });
        return;
      }

      await createNewSession(socket);

      // Start the AWS Bedrock connection
      console.log(`Starting AWS Bedrock connection for ${socket.id}`);
      bedrockClient.initiateBidirectionalStreaming(socket.id);

      // Update state to active
      sessionStates.set(socket.id, SessionState.ACTIVE);

      if (callback) callback({ success: true });

    } catch (error) {
      console.error('Error initializing session:', error);
      sessionStates.set(socket.id, SessionState.CLOSED);
      if (callback) callback({ success: false, error: error instanceof Error ? error.message : String(error) });
      socket.emit('error', {
        message: 'Failed to initialize session',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Audio input handler
  socket.on('audioInput', async (audioData) => {
    try {
      const session = socketSessions.get(socket.id);
      const currentState = sessionStates.get(socket.id);

      if (!session || currentState !== SessionState.ACTIVE) {
        console.error(`Invalid session state for audio input: session=${!!session}, state=${currentState}`);
        socket.emit('error', {
          message: 'No active session for audio input',
          details: `Session exists: ${!!session}, Session state: ${currentState}`
        });
        return;
      }

      // Convert base64 string to Buffer
      const audioBuffer = typeof audioData === 'string'
        ? Buffer.from(audioData, 'base64')
        : Buffer.from(audioData);

      // Stream the audio
      await session.streamAudio(audioBuffer);

    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', {
        message: 'Error processing audio',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  socket.on('promptStart', async () => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'No active session for prompt start' });
        return;
      }

      await session.setupSessionAndPromptStart();
      console.log(`Prompt start completed for ${socket.id}`);
    } catch (error) {
      console.error('Error processing prompt start:', error);
      socket.emit('error', {
        message: 'Error processing prompt start',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  socket.on('systemPrompt', async (data) => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'No active session for system prompt' });
        return;
      }

      await session.setupSystemPrompt(undefined, data);
      console.log(`System prompt completed for ${socket.id}`);
    } catch (error) {
      console.error('Error processing system prompt:', error);
      socket.emit('error', {
        message: 'Error processing system prompt',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  socket.on('audioStart', async () => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'No active session for audio start' });
        return;
      }

      await session.setupStartAudio();
      console.log(`Audio start setup completed for ${socket.id}`);
      socket.emit('audioReady');
    } catch (error) {
      console.error('Error processing audio start:', error);
      sessionStates.set(socket.id, SessionState.CLOSED);
      socket.emit('error', {
        message: 'Error processing audio start',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  socket.on('stopAudio', async () => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) {
        console.log('No active session to stop');
        return;
      }

      console.log('Stop audio requested, beginning shutdown sequence');
      sessionStates.set(socket.id, SessionState.CLOSED);

      await session.endAudioContent();
      await session.endPrompt();
      await session.close();

      socketSessions.delete(socket.id);
      socket.emit('sessionClosed');

    } catch (error) {
      console.error('Error processing streaming end events:', error);
      socket.emit('error', {
        message: 'Error processing streaming end events',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    const session = socketSessions.get(socket.id);
    if (session && bedrockClient.isSessionActive(socket.id)) {
      try {
        await session.endAudioContent();
        await session.endPrompt();
        await session.close();
      } catch (error) {
        console.error(`Error cleaning up session after disconnect: ${socket.id}`, error);
        bedrockClient.forceCloseSession(socket.id);
      }
    }

    socketSessions.delete(socket.id);
    sessionStates.delete(socket.id);
  });
});

// Start the server
const PORT = process.env.NOVA_SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Nova Sonic WebSocket server listening on port ${PORT}`);
  console.log(`Make sure your Next.js app is running on port 3000`);
});

export { io, httpServer };