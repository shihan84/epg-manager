import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

// Redis connection for BullMQ
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

// Queue definitions
export const queues = {
  epgGeneration: new Queue('epg-generation', { connection }),
  emailNotifications: new Queue('email-notifications', { connection }),
  dataCleanup: new Queue('data-cleanup', { connection }),
  reportGeneration: new Queue('report-generation', { connection }),
  webhookDelivery: new Queue('webhook-delivery', { connection }),
};

// Job types
export interface EPGGenerationJob {
  userId: string;
  channels: string[];
  startDate: string;
  endDate: string;
  format: 'xmltv' | 'json';
  includeImages: boolean;
}

export interface EmailNotificationJob {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export interface DataCleanupJob {
  type: 'old_schedules' | 'expired_epg' | 'audit_logs';
  olderThan: string;
}

export interface ReportGenerationJob {
  userId: string;
  reportType: 'usage' | 'performance' | 'compliance';
  startDate: string;
  endDate: string;
  format: 'pdf' | 'csv' | 'excel';
}

export interface WebhookDeliveryJob {
  url: string;
  event: string;
  payload: any;
  retryCount: number;
}

// Queue processors
export function setupQueueProcessors() {
  // EPG Generation processor
  new Worker(
    'epg-generation',
    async (job: Job<EPGGenerationJob>) => {
      const { userId, channels, startDate, endDate, format, includeImages } =
        job.data;

      console.log(`Processing EPG generation for user ${userId}`);

      // Simulate EPG generation process
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Update job progress
      await job.updateProgress(50);

      // Generate EPG file
      const epgUrl = `https://api.epgmanager.com/epg/${userId}/epg.${format}`;

      await job.updateProgress(100);

      return { epgUrl, generatedAt: new Date().toISOString() };
    },
    { connection }
  );

  // Email notification processor
  new Worker(
    'email-notifications',
    async (job: Job<EmailNotificationJob>) => {
      const { to, subject, template, data } = job.data;

      console.log(`Sending email to ${to}: ${subject}`);

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { sent: true, sentAt: new Date().toISOString() };
    },
    { connection }
  );

  // Data cleanup processor
  new Worker(
    'data-cleanup',
    async (job: Job<DataCleanupJob>) => {
      const { type, olderThan } = job.data;

      console.log(`Running data cleanup: ${type}`);

      // Simulate cleanup process
      await new Promise(resolve => setTimeout(resolve, 2000));

      return { cleaned: true, cleanedAt: new Date().toISOString() };
    },
    { connection }
  );

  // Report generation processor
  new Worker(
    'report-generation',
    async (job: Job<ReportGenerationJob>) => {
      const { userId, reportType, startDate, endDate, format } = job.data;

      console.log(`Generating ${reportType} report for user ${userId}`);

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const reportUrl = `https://api.epgmanager.com/reports/${userId}/${reportType}.${format}`;

      return { reportUrl, generatedAt: new Date().toISOString() };
    },
    { connection }
  );

  // Webhook delivery processor
  new Worker(
    'webhook-delivery',
    async (job: Job<WebhookDeliveryJob>) => {
      const { url, event, payload, retryCount } = job.data;

      console.log(`Delivering webhook to ${url}: ${event}`);

      try {
        // Simulate webhook delivery
        await new Promise(resolve => setTimeout(resolve, 500));

        return { delivered: true, deliveredAt: new Date().toISOString() };
      } catch (error) {
        // Retry logic
        if (retryCount < 3) {
          throw new Error(
            `Webhook delivery failed, will retry. Attempt ${retryCount + 1}`
          );
        }

        return {
          delivered: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      connection,
      settings: {
        retryProcessDelay: 5000,
        maxStalledCount: 1,
      },
    } as any
  );
}

// Queue management functions
export class QueueService {
  static async addEPGGeneration(jobData: EPGGenerationJob) {
    return await queues.epgGeneration.add('generate-epg', jobData, {
      priority: 1,
      delay: 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  static async addEmailNotification(jobData: EmailNotificationJob) {
    return await queues.emailNotifications.add('send-email', jobData, {
      priority: 2,
      delay: 0,
      attempts: 3,
    });
  }

  static async addDataCleanup(jobData: DataCleanupJob) {
    return await queues.dataCleanup.add('cleanup-data', jobData, {
      priority: 3,
      delay: 0,
      attempts: 1,
    });
  }

  static async addReportGeneration(jobData: ReportGenerationJob) {
    return await queues.reportGeneration.add('generate-report', jobData, {
      priority: 2,
      delay: 0,
      attempts: 2,
    });
  }

  static async addWebhookDelivery(jobData: WebhookDeliveryJob) {
    return await queues.webhookDelivery.add('deliver-webhook', jobData, {
      priority: 1,
      delay: 0,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  static async getQueueStats() {
    const stats = {};

    for (const [name, queue] of Object.entries(queues)) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    }

    return stats;
  }

  static async pauseQueue(queueName: keyof typeof queues) {
    await queues[queueName].pause();
  }

  static async resumeQueue(queueName: keyof typeof queues) {
    await queues[queueName].resume();
  }

  static async clearQueue(queueName: keyof typeof queues) {
    await queues[queueName].obliterate();
  }
}

// Initialize queue processors
setupQueueProcessors();
