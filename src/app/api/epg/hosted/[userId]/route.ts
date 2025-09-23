import { NextRequest, NextResponse } from 'next/server';
import { EPGGenerator } from '@/lib/epg-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get the latest EPG for the user
    const epgContent = await EPGGenerator.getLatestEPG(userId);

    if (!epgContent) {
      return NextResponse.json(
        { error: 'No EPG found for this user' },
        { status: 404 }
      );
    }

    // Return XMLTV content with proper headers
    return new NextResponse(epgContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('EPG hosting error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve EPG' },
      { status: 500 }
    );
  }
}
