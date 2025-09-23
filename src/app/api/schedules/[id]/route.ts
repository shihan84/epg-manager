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
    const schedule = await db.schedule.findFirst({
      where: {
        id,
        channel: { userId: session.user.id },
      },
      include: {
        channel: true,
        program: true,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
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
    const { channelId, programId, startTime, endTime, isLive, isNew } = body;

    // Check if schedule exists and belongs to user
    const existingSchedule = await db.schedule.findFirst({
      where: {
        id,
        channel: { userId: session.user.id },
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Verify channel belongs to user (if changing channel)
    if (channelId && channelId !== existingSchedule.channelId) {
      const channel = await db.channel.findFirst({
        where: {
          id: channelId,
          userId: session.user.id,
        },
      });

      if (!channel) {
        return NextResponse.json(
          { error: 'Channel not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Verify program belongs to user (if changing program)
    if (programId && programId !== existingSchedule.programId) {
      const program = await db.program.findFirst({
        where: {
          id: programId,
          userId: session.user.id,
        },
      });

      if (!program) {
        return NextResponse.json(
          { error: 'Program not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Check for overlapping schedules (excluding current schedule)
    if (startTime && endTime) {
      const overlappingSchedule = await db.schedule.findFirst({
        where: {
          id: { not: id },
          channelId: channelId || existingSchedule.channelId,
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(startTime) } },
                { endTime: { gt: new Date(startTime) } },
              ],
            },
            {
              AND: [
                { startTime: { lt: new Date(endTime) } },
                { endTime: { gte: new Date(endTime) } },
              ],
            },
            {
              AND: [
                { startTime: { gte: new Date(startTime) } },
                { endTime: { lte: new Date(endTime) } },
              ],
            },
          ],
        },
      });

      if (overlappingSchedule) {
        return NextResponse.json(
          { error: 'Schedule overlaps with existing schedule' },
          { status: 400 }
        );
      }
    }

    const schedule = await db.schedule.update({
      where: { id },
      data: {
        channelId: channelId || existingSchedule.channelId,
        programId: programId || existingSchedule.programId,
        startTime: startTime ? new Date(startTime) : existingSchedule.startTime,
        endTime: endTime ? new Date(endTime) : existingSchedule.endTime,
        isLive: isLive !== undefined ? isLive : existingSchedule.isLive,
        isNew: isNew !== undefined ? isNew : existingSchedule.isNew,
      },
      include: {
        channel: true,
        program: true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
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
    // Check if schedule exists and belongs to user
    const existingSchedule = await db.schedule.findFirst({
      where: {
        id,
        channel: { userId: session.user.id },
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    await db.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
