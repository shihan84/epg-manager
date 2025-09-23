import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EPGGenerator } from '@/lib/epg-generator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's EPG URL
    const epgUrl = await EPGGenerator.getHostedEPGUrl(session.user.id);

    // Check if user has an existing EPG
    const hasEPG = await EPGGenerator.getLatestEPG(session.user.id);

    return NextResponse.json({
      epgUrl: hasEPG ? epgUrl : null,
      hasEPG: !!hasEPG,
      format: 'xmltv',
      generatedAt: hasEPG ? new Date().toISOString() : null,
      downloadUrl: hasEPG
        ? `${process.env.NEXTAUTH_URL}/api/epg/download/${session.user.id}`
        : null,
      expiresAt: hasEPG
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error('EPG info error:', error);
    return NextResponse.json(
      { error: 'Failed to get EPG info' },
      { status: 500 }
    );
  }
}
