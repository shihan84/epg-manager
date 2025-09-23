import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription';
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

        const plan = await SubscriptionService.getPlan(params.id);

        if (!plan) {
          return NextResponse.json(
            { error: 'Subscription plan not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(plan);
      } catch (error) {
        console.error('Get subscription plan error:', error);
        return NextResponse.json(
          { error: 'Failed to get subscription plan' },
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
        const { name, description, price, features, limits, isActive } = body;

        const plan = await SubscriptionService.updatePlan(params.id, {
          name,
          description,
          price,
          features,
          limits,
          isActive,
        });

        return NextResponse.json(plan);
      } catch (error) {
        console.error('Update subscription plan error:', error);
        return NextResponse.json(
          { error: 'Failed to update subscription plan' },
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

        await SubscriptionService.deletePlan(params.id);
        return NextResponse.json({ message: 'Subscription plan deleted' });
      } catch (error) {
        console.error('Delete subscription plan error:', error);
        return NextResponse.json(
          { error: 'Failed to delete subscription plan' },
          { status: 500 }
        );
      }
    }
  )
);
