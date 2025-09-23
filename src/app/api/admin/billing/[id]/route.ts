import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/subscription';
import { BillingStatus } from '@prisma/client';
import {
  withRateLimiting,
  withEnterpriseSecurity,
} from '@/lib/enterprise-middleware';

export const PUT = withEnterpriseSecurity(
  withRateLimiting('api')(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status, paidDate } = body;

        if (!status || !Object.values(BillingStatus).includes(status)) {
          return NextResponse.json(
            { error: 'Invalid billing status' },
            { status: 400 }
          );
        }

        const billingRecord = await SubscriptionService.updateBillingStatus(
          params.id,
          status,
          paidDate ? new Date(paidDate) : undefined
        );

        return NextResponse.json(billingRecord);
      } catch (error) {
        console.error('Update billing status error:', error);
        return NextResponse.json(
          { error: 'Failed to update billing status' },
          { status: 500 }
        );
      }
    }
  )
);
