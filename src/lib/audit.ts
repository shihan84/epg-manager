import { db } from './db';
import { AuditLog } from './security';

export class AuditLogger {
  static async log(auditLog: AuditLog): Promise<void> {
    try {
      // In a real enterprise setup, you'd want to use a proper logging service
      // like Winston, Pino, or send to a centralized logging system
      console.log(`[AUDIT] ${JSON.stringify(auditLog)}`);

      // Store in database for compliance
      await db.auditLog.create({
        data: {
          id: auditLog.id,
          userId: auditLog.userId,
          action: auditLog.action,
          resource: auditLog.resource,
          resourceId: auditLog.resourceId,
          details: auditLog.details,
          ip: auditLog.ip,
          userAgent: auditLog.userAgent,
          timestamp: auditLog.timestamp,
        },
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  static async getUserActivity(userId: string, limit = 50) {
    return await db.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  static async getSystemActivity(limit = 100) {
    return await db.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  static async getResourceActivity(resource: string, resourceId: string) {
    return await db.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
