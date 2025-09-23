import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EPGGenerator } from '@/lib/epg-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    // Check if user is authorized to download this EPG
    if (
      !session?.user?.id ||
      (session.user.role !== 'ADMIN' && session.user.id !== userId)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the latest EPG for the user
    const epgContent = await EPGGenerator.getLatestEPG(userId);

    if (!epgContent) {
      return NextResponse.json(
        { error: 'No EPG found for this user' },
        { status: 404 }
      );
    }

    // Generate filename
    const filename = `epg_${userId}_${new Date().toISOString().split('T')[0]}.xml`;

    // Return file download
    return new NextResponse(epgContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('EPG download error:', error);
    return NextResponse.json(
      { error: 'Failed to download EPG' },
      { status: 500 }
    );
  }
}
