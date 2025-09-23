import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channels = await db.channel.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error('Get channels error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      number,
      logoUrl,
      streamUrl,
      language,
      region,
    } = body;

    // Validate required fields
    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
      );
    }

    // Check if channel number already exists for this user
    if (number) {
      const existingChannel = await db.channel.findFirst({
        where: {
          userId: session.user.id,
          number: parseInt(number),
        },
      });

      if (existingChannel) {
        return NextResponse.json(
          { error: 'Channel number already exists' },
          { status: 400 }
        );
      }
    }

    const channel = await db.channel.create({
      data: {
        name,
        displayName,
        description,
        number: number ? parseInt(number) : null,
        logoUrl,
        streamUrl,
        language: language || 'en',
        region: region || 'IN',
        userId: session.user.id,
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error('Create channel error:', error);
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}
