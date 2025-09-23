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

      const plans = await SubscriptionService.getPlans();
      return NextResponse.json(plans);
    } catch (error) {
      console.error('Get subscription plans error:', error);
      return NextResponse.json(
        { error: 'Failed to get subscription plans' },
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
      const { name, description, price, features, limits } = body;

      if (!name || !price || !features || !limits) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const plan = await SubscriptionService.createPlan({
        name,
        description,
        price,
        features,
        limits,
      });

      return NextResponse.json(plan, { status: 201 });
    } catch (error) {
      console.error('Create subscription plan error:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }
  })
);
