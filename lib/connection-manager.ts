import { bedrockClient, pollyClient } from './aws-config';

class AWSConnectionManager {
  private keepAliveInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.startKeepAlive();
  }

  private startKeepAlive() {
    // Ping AWS every 5 minutes to keep connections alive
    this.keepAliveInterval = setInterval(async () => {
      try {
        // Lightweight ping to keep credentials fresh
        await bedrockClient.config.credentials();
      } catch (error) {
        console.warn('Keep-alive ping failed:', error.message);
      }
    }, 5 * 60 * 1000);
  }

  public stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  public async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        if (attempt === maxRetries) throw error;
        
        if (error.name === 'TimeoutError' || error.name === 'NetworkingError') {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }
}

export const connectionManager = new AWSConnectionManager();

// Cleanup on process exit
process.on('SIGINT', () => {
  connectionManager.stopKeepAlive();
  process.exit(0);
});

process.on('SIGTERM', () => {
  connectionManager.stopKeepAlive();
  process.exit(0);
});