import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const channel = await db.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Get channel error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
      isActive,
    } = body;

    // Check if channel exists and belongs to user
    const existingChannel = await db.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check if channel number already exists for this user (if changing number)
    if (number && number !== existingChannel.number) {
      const duplicateChannel = await db.channel.findFirst({
        where: {
          userId: session.user.id,
          number: parseInt(number),
          id: { not: id },
        },
      });

      if (duplicateChannel) {
        return NextResponse.json(
          { error: 'Channel number already exists' },
          { status: 400 }
        );
      }
    }

    const channel = await db.channel.update({
      where: { id },
      data: {
        name,
        displayName,
        description,
        number: number ? parseInt(number) : null,
        logoUrl,
        streamUrl,
        language: language || existingChannel.language || 'en',
        region: region || existingChannel.region || 'IN',
        isActive: isActive !== undefined ? isActive : existingChannel.isActive,
      },
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Update channel error:', error);
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check if channel exists and belongs to user
    const existingChannel = await db.channel.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Check if channel has schedules
    const schedulesCount = await db.schedule.count({
      where: { channelId: id },
    });

    if (schedulesCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete channel with existing schedules. Please delete schedules first.',
        },
        { status: 400 }
      );
    }

    await db.channel.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    );
  }
}
