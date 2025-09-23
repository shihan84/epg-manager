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

      const billingHistory = await SubscriptionService.getAllBillingHistory();
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

export const POST = withEnterpriseSecurity(
  withRateLimiting('api')(async (request: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const { userId, subscriptionId, amount, dueDate, notes } = body;

      if (!userId || !subscriptionId || !amount || !dueDate) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const billingRecord = await SubscriptionService.createBillingRecord(
        userId,
        subscriptionId,
        amount,
        new Date(dueDate),
        notes
      );

      return NextResponse.json(billingRecord, { status: 201 });
    } catch (error) {
      console.error('Create billing record error:', error);
      return NextResponse.json(
        { error: 'Failed to create billing record' },
        { status: 500 }
      );
    }
  })
);
