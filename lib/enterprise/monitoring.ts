export interface ModelMetrics {
  modelId: string;
  requestCount: number;
  averageResponseTime: number;
  successRate: number;
  averageQualityScore: number;
  totalTokensUsed: number;
  lastUsed: string;
}

export interface PerformanceAlert {
  type: 'quality' | 'latency' | 'error_rate' | 'token_usage';
  severity: 'low' | 'medium' | 'high';
  message: string;
  modelId: string;
  timestamp: string;
}

export class ModelMonitoringService {
  private metrics: Map<string, ModelMetrics> = new Map();
  private alerts: PerformanceAlert[] = [];
  private readonly QUALITY_THRESHOLD = 70;
  private readonly LATENCY_THRESHOLD = 10000; // 10 seconds
  private readonly ERROR_RATE_THRESHOLD = 0.1; // 10%

  recordRequest(modelId: string, responseTime: number, success: boolean, qualityScore: number, tokensUsed?: number): void {
    const existing = this.metrics.get(modelId) || {
      modelId,
      requestCount: 0,
      averageResponseTime: 0,
      successRate: 1,
      averageQualityScore: 0,
      totalTokensUsed: 0,
      lastUsed: new Date().toISOString()
    };

    const newCount = existing.requestCount + 1;
    const newAvgResponseTime = ((existing.averageResponseTime * existing.requestCount) + responseTime) / newCount;
    const newSuccessRate = ((existing.successRate * existing.requestCount) + (success ? 1 : 0)) / newCount;
    const newAvgQuality = ((existing.averageQualityScore * existing.requestCount) + qualityScore) / newCount;

    const updated: ModelMetrics = {
      ...existing,
      requestCount: newCount,
      averageResponseTime: newAvgResponseTime,
      successRate: newSuccessRate,
      averageQualityScore: newAvgQuality,
      totalTokensUsed: existing.totalTokensUsed + (tokensUsed || 0),
      lastUsed: new Date().toISOString()
    };

    this.metrics.set(modelId, updated);
    this.checkAlerts(updated);
  }

  getMetrics(modelId?: string): ModelMetrics | ModelMetrics[] {
    if (modelId) {
      return this.metrics.get(modelId) || this.createEmptyMetrics(modelId);
    }
    return Array.from(this.metrics.values());
  }

  getAlerts(severity?: 'low' | 'medium' | 'high'): PerformanceAlert[] {
    return severity 
      ? this.alerts.filter(alert => alert.severity === severity)
      : this.alerts;
  }

  clearAlerts(modelId?: string): void {
    if (modelId) {
      this.alerts = this.alerts.filter(alert => alert.modelId !== modelId);
    } else {
      this.alerts = [];
    }
  }

  generateReport(): string {
    const allMetrics = Array.from(this.metrics.values());
    const totalRequests = allMetrics.reduce((sum, m) => sum + m.requestCount, 0);
    const avgQuality = allMetrics.reduce((sum, m) => sum + m.averageQualityScore, 0) / allMetrics.length;
    const avgLatency = allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length;

    return `
# Model Performance Report
Generated: ${new Date().toISOString()}

## Overall Statistics
- Total Requests: ${totalRequests}
- Average Quality Score: ${avgQuality.toFixed(2)}
- Average Response Time: ${avgLatency.toFixed(0)}ms
- Active Models: ${allMetrics.length}

## Model Performance
${allMetrics.map(m => `
### ${m.modelId}
- Requests: ${m.requestCount}
- Success Rate: ${(m.successRate * 100).toFixed(1)}%
- Quality Score: ${m.averageQualityScore.toFixed(2)}
- Avg Response Time: ${m.averageResponseTime.toFixed(0)}ms
- Tokens Used: ${m.totalTokensUsed.toLocaleString()}
- Last Used: ${new Date(m.lastUsed).toLocaleString()}
`).join('')}

## Active Alerts
${this.alerts.length === 0 ? 'No active alerts' : this.alerts.map(a => 
  `- [${a.severity.toUpperCase()}] ${a.message} (${a.modelId})`
).join('\n')}
    `.trim();
  }

  private checkAlerts(metrics: ModelMetrics): void {
    const now = new Date().toISOString();

    // Quality alert
    if (metrics.averageQualityScore < this.QUALITY_THRESHOLD && metrics.requestCount >= 5) {
      this.addAlert({
        type: 'quality',
        severity: metrics.averageQualityScore < 50 ? 'high' : 'medium',
        message: `Quality score below threshold: ${metrics.averageQualityScore.toFixed(2)}`,
        modelId: metrics.modelId,
        timestamp: now
      });
    }

    // Latency alert
    if (metrics.averageResponseTime > this.LATENCY_THRESHOLD) {
      this.addAlert({
        type: 'latency',
        severity: metrics.averageResponseTime > 20000 ? 'high' : 'medium',
        message: `High response time: ${metrics.averageResponseTime.toFixed(0)}ms`,
        modelId: metrics.modelId,
        timestamp: now
      });
    }

    // Error rate alert
    if (metrics.successRate < (1 - this.ERROR_RATE_THRESHOLD) && metrics.requestCount >= 10) {
      this.addAlert({
        type: 'error_rate',
        severity: metrics.successRate < 0.8 ? 'high' : 'medium',
        message: `High error rate: ${((1 - metrics.successRate) * 100).toFixed(1)}%`,
        modelId: metrics.modelId,
        timestamp: now
      });
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    // Avoid duplicate alerts
    const exists = this.alerts.some(a => 
      a.type === alert.type && 
      a.modelId === alert.modelId && 
      Date.now() - new Date(a.timestamp).getTime() < 300000 // 5 minutes
    );

    if (!exists) {
      this.alerts.push(alert);
      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }
    }
  }

  private createEmptyMetrics(modelId: string): ModelMetrics {
    return {
      modelId,
      requestCount: 0,
      averageResponseTime: 0,
      successRate: 1,
      averageQualityScore: 0,
      totalTokensUsed: 0,
      lastUsed: new Date().toISOString()
    };
  }
}

export const modelMonitoring = new ModelMonitoringService();