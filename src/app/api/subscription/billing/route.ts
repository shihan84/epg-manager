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

      const billingHistory = await SubscriptionService.getBillingHistory(
        session.user.id
      );
      return NextResponse.json(billingHistory);
    } catch (error) {
      console.error('Get billing history error:', error);
      return NextResponse.json(
        { error: 'Failed to get billing history' },
        { status: 500 }
      );
    }
  })
);
