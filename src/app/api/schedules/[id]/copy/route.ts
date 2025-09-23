import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
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
    const { newStartTime, newEndTime, channelId } = body;

    // Get the original schedule
    const originalSchedule = await db.schedule.findFirst({
      where: {
        id,
        channel: { userId: session.user.id },
      },
      include: {
        channel: true,
        program: true,
      },
    });

    if (!originalSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Use provided channel or original channel
    const targetChannelId = channelId || originalSchedule.channelId;

    // Verify target channel belongs to user
    const targetChannel = await db.channel.findFirst({
      where: {
        id: targetChannelId,
        userId: session.user.id,
      },
    });

    if (!targetChannel) {
      return NextResponse.json(
        { error: 'Target channel not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate new times
    const originalDuration =
      originalSchedule.endTime.getTime() - originalSchedule.startTime.getTime();
    const newStart = newStartTime
      ? new Date(newStartTime)
      : new Date(originalSchedule.startTime.getTime() + 24 * 60 * 60 * 1000); // Next day
    const newEnd = newEndTime
      ? new Date(newEndTime)
      : new Date(newStart.getTime() + originalDuration);

    // Check for overlapping schedules
    const overlappingSchedule = await db.schedule.findFirst({
      where: {
        channelId: targetChannelId,
        OR: [
          {
            AND: [
              { startTime: { lte: newStart } },
              { endTime: { gt: newStart } },
            ],
          },
          {
            AND: [{ startTime: { lt: newEnd } }, { endTime: { gte: newEnd } }],
          },
          {
            AND: [
              { startTime: { gte: newStart } },
              { endTime: { lte: newEnd } },
            ],
          },
        ],
      },
    });

    if (overlappingSchedule) {
      return NextResponse.json(
        { error: 'Copied schedule overlaps with existing schedule' },
        { status: 400 }
      );
    }

    // Create a copy of the schedule
    const copiedSchedule = await db.schedule.create({
      data: {
        channelId: targetChannelId,
        programId: originalSchedule.programId,
        startTime: newStart,
        endTime: newEnd,
        isLive: originalSchedule.isLive,
        isNew: false, // Copied schedules are not new
      },
      include: {
        channel: true,
        program: true,
      },
    });

    return NextResponse.json(copiedSchedule, { status: 201 });
  } catch (error) {
    console.error('Copy schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to copy schedule' },
      { status: 500 }
    );
  }
}
