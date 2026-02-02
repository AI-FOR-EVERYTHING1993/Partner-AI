import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface BedrockStatus {
  available: boolean;
  lastError?: string;
  timestamp: string;
}

export function BedrockStatusIndicator() {
  const [status, setStatus] = useState<BedrockStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBedrockStatus();
    // Check status every 5 minutes
    const interval = setInterval(checkBedrockStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkBedrockStatus = async () => {
    try {
      const response = await fetch('/api/bedrock/health');
      const data = await response.json();
      
      setStatus({
        available: data.bedrock?.success || false,
        lastError: data.bedrock?.error,
        timestamp: data.timestamp
      });
    } catch (error) {
      setStatus({
        available: false,
        lastError: 'Connection failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Checking AI Status...
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={status?.available ? "default" : "secondary"}
        className={status?.available ? "bg-green-500" : "bg-yellow-500"}
      >
        {status?.available ? "AI Enhanced" : "Standard Mode"}
      </Badge>
      
      {!status?.available && (
        <span className="text-xs text-muted-foreground">
          Using fallback responses
        </span>
      )}
    </div>
  );
}