import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription';
import {
  withRateLimiting,
  withEnterpriseSecurity,
} from '@/lib/enterprise-middleware';

export const GET = withEnterpriseSecurity(
  withRateLimiting('api')(async (request: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const subscriptions = await SubscriptionService.getAllSubscriptions();
      return NextResponse.json(subscriptions);
    } catch (error) {
      console.error('Get subscriptions error:', error);
      return NextResponse.json(
        { error: 'Failed to get subscriptions' },
        { status: 500 }
      );
    }
  })
);

export const POST = withEnterpriseSecurity(
  withRateLimiting('api')(async (request: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { userId, planId, startDate, autoRenew } = body;

      if (!userId || !planId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const subscription = await SubscriptionService.createSubscription({
        userId,
        planId,
        startDate: startDate ? new Date(startDate) : undefined,
        autoRenew,
      });

      return NextResponse.json(subscription, { status: 201 });
    } catch (error) {
      console.error('Create subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }
  })
);
