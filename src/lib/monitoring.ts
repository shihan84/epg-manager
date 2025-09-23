import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog, logSecurityEvent } from './security';
import { AuditLogger } from './audit';

type HandlerFunction = (
  request: NextRequest,
  ...args: any[]
) => Promise<NextResponse>;

export interface Metrics {
  requestCount: number;
  errorCount: number;
  responseTime: number;
  activeUsers: number;
  memoryUsage: number;
  cpuUsage: number;
}

export class MonitoringService {
  private static metrics: Metrics = {
    requestCount: 0,
    errorCount: 0,
    responseTime: 0,
    activeUsers: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  };

  static async trackRequest(
    request: NextRequest,
    response: NextResponse,
    startTime: number,
    userId?: string
  ) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Update metrics
    this.metrics.requestCount++;
    this.metrics.responseTime = responseTime;

    if (response.status >= 400) {
      this.metrics.errorCount++;
    }

    // Log security events for failed requests
    if (response.status >= 400) {
      logSecurityEvent(
        'request_failed',
        {
          status: response.status,
          url: request.url,
          method: request.method,
          responseTime,
        },
        request
      );
    }

    // Create audit log for authenticated requests
    if (userId) {
      const auditLog = createAuditLog(
        userId,
        'api_request',
        'system',
        'request',
        {
          method: request.method,
          url: request.url,
          status: response.status,
          responseTime,
        },
        request
      );
      await AuditLogger.log(auditLog);
    }
  }

  static getMetrics(): Metrics {
    return { ...this.metrics };
  }

  static async getSystemHealth() {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      system: {
        memory: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
        },
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };
  }

  static async getPerformanceMetrics() {
    return {
      requestsPerMinute: this.metrics.requestCount,
      averageResponseTime: this.metrics.responseTime,
      errorRate:
        this.metrics.errorCount / Math.max(this.metrics.requestCount, 1),
      activeUsers: this.metrics.activeUsers,
    };
  }

  static resetMetrics() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: 0,
      activeUsers: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
  }
}

export function withMonitoring(handler: HandlerFunction) {
  return async function (request: NextRequest, ...args: any[]) {
    const startTime = Date.now();
    let response: NextResponse;

    try {
      response = await handler(request, ...args);
    } catch (error) {
      console.error('Request handler error:', error);
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Extract user ID from session if available
    const userId = request.headers.get('x-user-id') || undefined;

    // Track the request
    await MonitoringService.trackRequest(request, response, startTime, userId);

    return response;
  };
}
