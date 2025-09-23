import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription';
import { SubscriptionStatus } from '@prisma/client';
import {
  withRateLimiting,
  withEnterpriseSecurity,
} from '@/lib/enterprise-middleware';

export const GET = withEnterpriseSecurity(
  withRateLimiting('api')(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscription = await SubscriptionService.getUserSubscription(
          params.id
        );

        if (!subscription) {
          return NextResponse.json(
            { error: 'Subscription not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(subscription);
      } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json(
          { error: 'Failed to get subscription' },
          { status: 500 }
        );
      }
    }
  )
);

export const PUT = withEnterpriseSecurity(
  withRateLimiting('api')(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, endDate } = body;

        if (!status || !Object.values(SubscriptionStatus).includes(status)) {
          return NextResponse.json(
            { error: 'Invalid subscription status' },
            { status: 400 }
          );
        }

        const subscription = await SubscriptionService.updateSubscriptionStatus(
          params.id,
          status,
          endDate ? new Date(endDate) : undefined
        );

        return NextResponse.json(subscription);
      } catch (error) {
        console.error('Update subscription error:', error);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    }
  )
);

export const DELETE = withEnterpriseSecurity(
  withRateLimiting('api')(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { endDate } = body;

        await SubscriptionService.cancelSubscription(
          params.id,
          endDate ? new Date(endDate) : undefined
        );

        return NextResponse.json({ message: 'Subscription cancelled' });
      } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json(
          { error: 'Failed to cancel subscription' },
          { status: 500 }
        );
      }
    }
  )
);
