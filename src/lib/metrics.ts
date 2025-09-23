import {
  register,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics();

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

export const totalChannels = new Gauge({
  name: 'total_channels',
  help: 'Total number of channels',
});

export const totalPrograms = new Gauge({
  name: 'total_programs',
  help: 'Total number of programs',
});

export const totalSchedules = new Gauge({
  name: 'total_schedules',
  help: 'Total number of schedules',
});

export const epgGenerationDuration = new Histogram({
  name: 'epg_generation_duration_seconds',
  help: 'Duration of EPG generation in seconds',
  labelNames: ['user_id', 'format'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
});

export const epgGenerationTotal = new Counter({
  name: 'epg_generations_total',
  help: 'Total number of EPG generations',
  labelNames: ['user_id', 'format', 'status'],
});

export const databaseConnections = new Gauge({
  name: 'database_connections',
  help: 'Number of database connections',
});

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
});

export const queueJobsTotal = new Counter({
  name: 'queue_jobs_total',
  help: 'Total number of queue jobs',
  labelNames: ['queue_name', 'status'],
});

export const queueJobDuration = new Histogram({
  name: 'queue_job_duration_seconds',
  help: 'Duration of queue jobs in seconds',
  labelNames: ['queue_name', 'job_type'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600],
});

export const securityEvents = new Counter({
  name: 'security_events_total',
  help: 'Total number of security events',
  labelNames: ['event_type', 'severity'],
});

export const apiKeyUsage = new Counter({
  name: 'api_key_usage_total',
  help: 'Total number of API key usages',
  labelNames: ['user_id', 'key_id'],
});

export const webhookDeliveries = new Counter({
  name: 'webhook_deliveries_total',
  help: 'Total number of webhook deliveries',
  labelNames: ['user_id', 'status'],
});

export const errorRate = new Gauge({
  name: 'error_rate',
  help: 'Current error rate',
});

export const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
});

export const cpuUsage = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage',
});

// Metrics collection functions
export class MetricsCollector {
  static recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ) {
    httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration / 1000
    );
    httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  static recordEPGGeneration(
    userId: string,
    format: string,
    duration: number,
    status: 'success' | 'error'
  ) {
    epgGenerationDuration.observe({ user_id: userId, format }, duration / 1000);
    epgGenerationTotal.inc({ user_id: userId, format, status });
  }

  static recordCacheHit(cacheType: string) {
    cacheHits.inc({ cache_type: cacheType });
  }

  static recordCacheMiss(cacheType: string) {
    cacheMisses.inc({ cache_type: cacheType });
  }

  static recordQueueJob(
    queueName: string,
    jobType: string,
    duration: number,
    status: 'success' | 'error'
  ) {
    queueJobDuration.observe(
      { queue_name: queueName, job_type: jobType },
      duration / 1000
    );
    queueJobsTotal.inc({ queue_name: queueName, status });
  }

  static recordSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    securityEvents.inc({ event_type: eventType, severity });
  }

  static recordAPIKeyUsage(userId: string, keyId: string) {
    apiKeyUsage.inc({ user_id: userId, key_id: keyId });
  }

  static recordWebhookDelivery(userId: string, status: 'success' | 'failed') {
    webhookDeliveries.inc({ user_id: userId, status });
  }

  static updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    memoryUsage.set(memUsage.heapUsed);

    // Update business metrics
    this.updateBusinessMetrics();
  }

  static async updateBusinessMetrics() {
    try {
      // These would be actual database queries in a real implementation
      // For now, we'll use mock values
      activeUsers.set(150);
      totalChannels.set(500);
      totalPrograms.set(2500);
      totalSchedules.set(10000);
    } catch (error) {
      console.error('Failed to update business metrics:', error);
    }
  }

  static calculateErrorRate() {
    // This would calculate actual error rate from recent requests
    // For now, we'll use a mock calculation
    const totalRequests = 100; // Mock value
    const errorRequests = 5; // Mock value

    const rate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
    errorRate.set(rate);
  }
}

// Start metrics collection
setInterval(() => {
  MetricsCollector.updateSystemMetrics();
  MetricsCollector.calculateErrorRate();
}, 30000); // Update every 30 seconds

export { register };
