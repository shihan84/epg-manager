import { NextRequest, NextResponse } from 'next/server';
import { EPG_FORMATS } from '@/lib/epg-formats';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(EPG_FORMATS);
  } catch (error) {
    console.error('Get EPG formats error:', error);
    return NextResponse.json(
      { error: 'Failed to get EPG formats' },
      { status: 500 }
    );
  }
}
