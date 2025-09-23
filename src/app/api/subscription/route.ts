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

      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const subscription = await SubscriptionService.getUserSubscription(
        session.user.id
      );
      const limits = await SubscriptionService.getUserLimits(session.user.id);

      return NextResponse.json({
        subscription,
        limits,
        hasActiveSubscription: await SubscriptionService.hasActiveSubscription(
          session.user.id
        ),
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      return NextResponse.json(
        { error: 'Failed to get subscription' },
        { status: 500 }
      );
    }
  })
);
