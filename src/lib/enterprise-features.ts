import { db } from './db';
import { QueueService } from './queue';
import { cache } from './cache';
import { randomBytes } from 'crypto';

export interface EnterpriseLicense {
  id: string;
  userId: string;
  type: 'basic' | 'professional' | 'enterprise';
  features: string[];
  limits: {
    channels: number;
    programs: number;
    schedules: number;
    users: number;
    apiCalls: number;
    storage: number; // in MB
  };
  expiresAt: Date;
  isActive: boolean;
}

export interface UsageMetrics {
  userId: string;
  channels: number;
  programs: number;
  schedules: number;
  users: number;
  apiCalls: number;
  storageUsed: number;
  lastUpdated: Date;
}

export class EnterpriseFeatures {
  // License management
  static async createLicense(
    userId: string,
    type: 'basic' | 'professional' | 'enterprise'
  ): Promise<EnterpriseLicense> {
    const licenseConfig = this.getLicenseConfig(type);

    const license = await db.enterpriseLicense.create({
      data: {
        userId,
        type,
        features: licenseConfig.features,
        limits: licenseConfig.limits,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
      },
    });

    return license as unknown as EnterpriseLicense;
  }

  static async getLicense(userId: string): Promise<EnterpriseLicense | null> {
    const cached = await cache.get<EnterpriseLicense>(`license:${userId}`);
    if (cached) return cached;

    const license = await db.enterpriseLicense.findFirst({
      where: { userId, isActive: true },
    });

    if (license) {
      await cache.set(`license:${userId}`, license, 3600); // Cache for 1 hour
    }

    return license as unknown as EnterpriseLicense | null;
  }

  static async checkFeatureAccess(
    userId: string,
    feature: string
  ): Promise<boolean> {
    const license = await this.getLicense(userId);
    if (!license) return false;

    return license.features.includes(feature);
  }

  static async checkUsageLimit(
    userId: string,
    resource: keyof EnterpriseLicense['limits']
  ): Promise<boolean> {
    const license = await this.getLicense(userId);
    if (!license) return false;

    const usage = await this.getUsageMetrics(userId);
    const limit = license.limits[resource];

    switch (resource) {
      case 'channels':
        return usage.channels < limit;
      case 'programs':
        return usage.programs < limit;
      case 'schedules':
        return usage.schedules < limit;
      case 'users':
        return usage.users < limit;
      case 'apiCalls':
        return usage.apiCalls < limit;
      case 'storage':
        return usage.storageUsed < limit;
      default:
        return false;
    }
  }

  // Usage tracking
  static async getUsageMetrics(userId: string): Promise<UsageMetrics> {
    const cached = await cache.get<UsageMetrics>(`usage:${userId}`);
    if (cached) return cached;

    const [channels, programs, schedules, users, apiCalls, storageUsed] =
      await Promise.all([
        db.channel.count({ where: { userId } }),
        db.program.count({ where: { userId } }),
        db.schedule.count({ where: { channel: { userId } } }),
        db.user.count({ where: { id: userId } }), // Count of users (1 for individual user)
        db.auditLog.count({
          where: {
            userId,
            action: 'api_request',
            timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          },
        }),
        this.calculateStorageUsage(userId),
      ]);

    const usage: UsageMetrics = {
      userId,
      channels,
      programs,
      schedules,
      users,
      apiCalls,
      storageUsed,
      lastUpdated: new Date(),
    };

    await cache.set(`usage:${userId}`, usage, 300); // Cache for 5 minutes
    return usage;
  }

  static async calculateStorageUsage(userId: string): Promise<number> {
    const epgFiles = await db.epgFile.findMany({
      where: { userId },
      select: { content: true },
    });

    return (
      epgFiles.reduce((total, file) => {
        return total + Buffer.byteLength(file.content, 'utf8');
      }, 0) /
      (1024 * 1024)
    ); // Convert to MB
  }

  // Advanced EPG features
  static async generateAdvancedEPG(userId: string, options: any) {
    const hasAccess = await this.checkFeatureAccess(userId, 'advanced_epg');
    if (!hasAccess) {
      throw new Error('Advanced EPG generation requires enterprise license');
    }

    return await QueueService.addEPGGeneration({
      userId,
      channels: options.channels,
      startDate: options.startDate,
      endDate: options.endDate,
      format: options.format || 'xmltv',
      includeImages: options.includeImages || false,
    });
  }

  // Multi-tenant support
  static async createOrganization(name: string, adminUserId: string) {
    const hasAccess = await this.checkFeatureAccess(
      adminUserId,
      'multi_tenant'
    );
    if (!hasAccess) {
      throw new Error('Multi-tenant support requires enterprise license');
    }

    const organization = await db.organization.create({
      data: {
        name,
        adminUserId,
        settings: {
          maxUsers: 100,
          maxChannels: 1000,
          customDomain: null,
        },
      },
    });

    return organization;
  }

  // API key management
  static async createAPIKey(
    userId: string,
    name: string,
    permissions: string[]
  ) {
    const hasAccess = await this.checkFeatureAccess(userId, 'api_access');
    if (!hasAccess) {
      throw new Error('API access requires professional or enterprise license');
    }

    const apiKey = await db.apiKey.create({
      data: {
        name,
        key: this.generateAPIKey(),
        userId,
        permissions,
        isActive: true,
      },
    });

    return apiKey;
  }

  static async revokeAPIKey(userId: string, keyId: string) {
    await db.apiKey.update({
      where: { id: keyId, userId },
      data: { isActive: false },
    });
  }

  // Webhook management
  static async createWebhook(userId: string, url: string, events: string[]) {
    const hasAccess = await this.checkFeatureAccess(userId, 'webhooks');
    if (!hasAccess) {
      throw new Error(
        'Webhook support requires professional or enterprise license'
      );
    }

    const webhook = await db.webhook.create({
      data: {
        userId,
        url,
        events,
        isActive: true,
        secret: this.generateWebhookSecret(),
      },
    });

    return webhook;
  }

  // Analytics and reporting
  static async generateUsageReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const hasAccess = await this.checkFeatureAccess(userId, 'analytics');
    if (!hasAccess) {
      throw new Error('Analytics requires professional or enterprise license');
    }

    return await QueueService.addReportGeneration({
      userId,
      reportType: 'usage',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      format: 'pdf',
    });
  }

  // White-label support
  static async updateWhiteLabelSettings(userId: string, settings: any) {
    const hasAccess = await this.checkFeatureAccess(userId, 'white_label');
    if (!hasAccess) {
      throw new Error('White-label support requires enterprise license');
    }

    // Note: whiteLabelSettings field not available in current schema
    // This would need to be added to the User model in Prisma schema
    console.log('White label settings update requested:', settings);
  }

  // SSO integration
  static async configureSSO(
    userId: string,
    provider: 'saml' | 'oauth',
    config: any
  ) {
    const hasAccess = await this.checkFeatureAccess(userId, 'sso');
    if (!hasAccess) {
      throw new Error('SSO integration requires enterprise license');
    }

    await db.sSOConfig.create({
      data: {
        userId,
        provider,
        config,
        isActive: true,
      },
    });
  }

  // Helper methods
  private static getLicenseConfig(
    type: 'basic' | 'professional' | 'enterprise'
  ) {
    const configs = {
      basic: {
        features: ['basic_epg', 'channel_management', 'program_management'],
        limits: {
          channels: 10,
          programs: 100,
          schedules: 1000,
          users: 1,
          apiCalls: 1000,
          storage: 100,
        },
      },
      professional: {
        features: [
          'basic_epg',
          'advanced_epg',
          'api_access',
          'webhooks',
          'analytics',
        ],
        limits: {
          channels: 100,
          programs: 1000,
          schedules: 10000,
          users: 10,
          apiCalls: 10000,
          storage: 1000,
        },
      },
      enterprise: {
        features: [
          'basic_epg',
          'advanced_epg',
          'api_access',
          'webhooks',
          'analytics',
          'multi_tenant',
          'white_label',
          'sso',
        ],
        limits: {
          channels: -1, // Unlimited
          programs: -1,
          schedules: -1,
          users: -1,
          apiCalls: -1,
          storage: -1,
        },
      },
    };

    return configs[type];
  }

  private static generateAPIKey(): string {
    const prefix = 'epg_';
    const randomPart = randomBytes(32).toString('hex');
    return `${prefix}${randomPart}`;
  }

  private static generateWebhookSecret(): string {
    return randomBytes(32).toString('hex');
  }
}
