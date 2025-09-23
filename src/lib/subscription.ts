import { db } from './db';
import { SubscriptionStatus, BillingStatus } from '@prisma/client';

export interface SubscriptionPlanData {
  name: string;
  description?: string;
  price: number;
  features: string[];
  limits: {
    channels: number;
    programs: number;
    schedules: number;
    epgGenerations: number;
    apiCalls: number;
  };
  isActive?: boolean;
}

export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  startDate?: Date;
  autoRenew?: boolean;
}

export class SubscriptionService {
  // Subscription Plans Management
  static async createPlan(data: SubscriptionPlanData) {
    return await db.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        features: data.features,
        limits: data.limits,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async getPlans() {
    return await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  static async getPlan(id: string) {
    return await db.subscriptionPlan.findUnique({
      where: { id },
    });
  }

  static async updatePlan(id: string, data: Partial<SubscriptionPlanData>) {
    return await db.subscriptionPlan.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  static async deletePlan(id: string) {
    return await db.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Subscription Management
  static async createSubscription(data: CreateSubscriptionData) {
    const plan = await this.getPlan(data.planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    const startDate = data.startDate || new Date();
    const nextBillingDate = new Date(startDate);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    return await db.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        startDate,
        nextBillingDate,
        autoRenew: data.autoRenew ?? true,
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    });
  }

  static async getUserSubscription(userId: string) {
    return await db.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
        billingHistory: {
          orderBy: { billingDate: 'desc' },
          take: 10,
        },
      },
    });
  }

  static async getAllSubscriptions() {
    return await db.subscription.findMany({
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
        billingHistory: {
          orderBy: { billingDate: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
    endDate?: Date
  ) {
    return await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status,
        endDate,
        updatedAt: new Date(),
      },
    });
  }

  static async cancelSubscription(subscriptionId: string, endDate?: Date) {
    const actualEndDate = endDate || new Date();
    return await this.updateSubscriptionStatus(
      subscriptionId,
      SubscriptionStatus.CANCELLED,
      actualEndDate
    );
  }

  static async suspendSubscription(subscriptionId: string) {
    return await this.updateSubscriptionStatus(
      subscriptionId,
      SubscriptionStatus.SUSPENDED
    );
  }

  static async reactivateSubscription(subscriptionId: string) {
    return await this.updateSubscriptionStatus(
      subscriptionId,
      SubscriptionStatus.ACTIVE
    );
  }

  // Billing Management
  static async createBillingRecord(
    userId: string,
    subscriptionId: string,
    amount: number,
    dueDate: Date,
    notes?: string
  ) {
    return await db.billingHistory.create({
      data: {
        userId,
        subscriptionId,
        amount,
        dueDate,
        notes,
      },
    });
  }

  static async updateBillingStatus(
    billingId: string,
    status: BillingStatus,
    paidDate?: Date
  ) {
    return await db.billingHistory.update({
      where: { id: billingId },
      data: {
        status,
        paidDate,
        updatedAt: new Date(),
      },
    });
  }

  static async getBillingHistory(userId: string) {
    return await db.billingHistory.findMany({
      where: { userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: { billingDate: 'desc' },
    });
  }

  static async getAllBillingHistory() {
    return await db.billingHistory.findMany({
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
      orderBy: { billingDate: 'desc' },
    });
  }

  // Utility Methods
  static async getExpiringSubscriptions(days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: {
          lte: futureDate,
        },
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    });
  }

  static async getOverdueSubscriptions() {
    return await db.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: {
          lt: new Date(),
        },
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    });
  }

  static async getSubscriptionStats() {
    const totalSubscriptions = await db.subscription.count();
    const activeSubscriptions = await db.subscription.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
    const cancelledSubscriptions = await db.subscription.count({
      where: { status: SubscriptionStatus.CANCELLED },
    });
    const suspendedSubscriptions = await db.subscription.count({
      where: { status: SubscriptionStatus.SUSPENDED },
    });

    const totalRevenue = await db.billingHistory.aggregate({
      where: { status: BillingStatus.PAID },
      _sum: { amount: true },
    });

    const monthlyRevenue = await db.billingHistory.aggregate({
      where: {
        status: BillingStatus.PAID,
        billingDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    });

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      suspendedSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
    };
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: { id: true, status: true, endDate: true },
    });

    if (!subscription) return false;

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      if (subscription.endDate && subscription.endDate < new Date()) {
        // Subscription has expired
        await this.updateSubscriptionStatus(
          subscription.id,
          SubscriptionStatus.EXPIRED
        );
        return false;
      }
      return true;
    }

    return false;
  }

  // Get user's subscription limits
  static async getUserLimits(userId: string) {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      // Return default limits for users without active subscription
      return {
        channels: 5,
        programs: 50,
        schedules: 100,
        epgGenerations: 10,
        apiCalls: 1000,
      };
    }

    return subscription.plan.limits as any;
  }
}
