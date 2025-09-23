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

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const schedules = await db.schedule.findMany({
      where: {
        channel: { userId: session.user.id },
        ...(channelId && { channelId }),
        ...(startDate &&
          endDate && {
            startTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        channel: true,
        program: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
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
    const { channelId, programId, startTime, endTime, isLive, isNew } = body;

    // Validate required fields
    if (!channelId || !programId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Channel, program, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Verify channel belongs to user
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

    // Verify program belongs to user
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

    // Check for overlapping schedules
    const overlappingSchedule = await db.schedule.findFirst({
      where: {
        channelId,
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

    const schedule = await db.schedule.create({
      data: {
        channelId,
        programId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isLive: isLive || false,
        isNew: isNew || false,
      },
      include: {
        channel: true,
        program: true,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}
