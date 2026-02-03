import { NextRequest, NextResponse } from 'next/server';
import { enterpriseModelService, modelMonitoring } from '@/lib/enterprise';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const report = searchParams.get('report') === 'true';

    if (report) {
      const reportContent = enterpriseModelService.generateReport();
      return new NextResponse(reportContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': 'attachment; filename="model-performance-report.txt"'
        }
      });
    }

    const health = enterpriseModelService.getModelHealth();
    
    if (detailed) {
      const alerts = modelMonitoring.getAlerts();
      const metrics = modelMonitoring.getMetrics() as any[];
      
      return NextResponse.json({
        ...health,
        detailed: {
          alerts: alerts.map(alert => ({
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            model: alert.modelId,
            time: alert.timestamp
          })),
          modelMetrics: metrics.map(m => ({
            id: m.modelId,
            requests: m.requestCount,
            successRate: `${(m.successRate * 100).toFixed(1)}%`,
            avgQuality: m.averageQualityScore.toFixed(2),
            avgLatency: `${m.averageResponseTime.toFixed(0)}ms`,
            tokensUsed: m.totalTokensUsed.toLocaleString(),
            lastUsed: new Date(m.lastUsed).toLocaleString()
          }))
        }
      });
    }

    return NextResponse.json(health);

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
        status: 'unhealthy'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'clear-cache':
        enterpriseModelService.clearCache();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      case 'clear-alerts':
        const { modelId } = await request.json();
        modelMonitoring.clearAlerts(modelId);
        return NextResponse.json({ success: true, message: 'Alerts cleared' });

      case 'test-models':
        const testResults = await testAllModels();
        return NextResponse.json({ success: true, results: testResults });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Health management error:', error);
    return NextResponse.json(
      { error: 'Management action failed' },
      { status: 500 }
    );
  }
}

async function testAllModels() {
  const models = [
    process.env.INTERVIEW_DEFAULT_MODEL!,
    process.env.RESUME_ANALYSIS_MODEL!,
    process.env.FEEDBACK_MODEL!,
    process.env.FAST_MODEL!
  ];

  const results = [];

  for (const modelId of models) {
    try {
      const startTime = Date.now();
      const response = await enterpriseModelService.invoke({
        modelId,
        prompt: 'Test message: Please respond with "Model working correctly"',
        responseType: 'general'
      });
      
      results.push({
        modelId,
        status: response.success ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        qualityScore: response.metadata.quality.score,
        error: response.success ? null : response.content
      });
    } catch (error) {
      results.push({
        modelId,
        status: 'error',
        responseTime: 0,
        qualityScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}