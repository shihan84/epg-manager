import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EPGGenerator } from '@/lib/epg-generator';
import {
  withRateLimiting,
  withEnterpriseSecurity,
} from '@/lib/enterprise-middleware';

export const POST = withEnterpriseSecurity(
  withRateLimiting('api')(async (request: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const {
        channels,
        startDate,
        endDate,
        format = 'xmltv',
        includeImages = true,
        platform,
      } = body;

      // Generate EPG
      const result = await EPGGenerator.generateEPG({
        userId: session.user.id,
        channels,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        format,
        includeImages,
        platform,
      });

      // Update user's EPG URL
      await EPGGenerator.updateUserEPGUrl(session.user.id);
      const epgUrl = await EPGGenerator.getHostedEPGUrl(session.user.id);

      return NextResponse.json({
        success: true,
        epgUrl,
        format,
        generatedAt: new Date().toISOString(),
        downloadUrl: `${process.env.NEXTAUTH_URL}/api/epg/download/${session.user.id}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
    } catch (error) {
      console.error('EPG generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate EPG' },
        { status: 500 }
      );
    }
  })
);
