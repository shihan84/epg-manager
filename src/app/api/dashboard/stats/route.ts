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

    const userId = session.user.id;

    // Get total channels
    const totalChannels = await db.channel.count({
      where: { userId, isActive: true },
    });

    // Get total programs
    const totalPrograms = await db.program.count({
      where: { userId },
    });

    // Get total schedules
    const totalSchedules = await db.schedule.count({
      where: {
        channel: {
          userId,
        },
      },
    });

    // Get recent schedules with program and channel info
    const recentSchedules = await db.schedule.findMany({
      where: {
        channel: {
          userId,
        },
      },
      include: {
        program: true,
        channel: true,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 5,
    });

    const formattedSchedules = recentSchedules.map(schedule => ({
      id: schedule.id,
      programTitle: schedule.program.title,
      channelName: schedule.channel.displayName || schedule.channel.name,
      startTime: schedule.startTime.toISOString(),
      endTime: schedule.endTime.toISOString(),
    }));

    return NextResponse.json({
      totalChannels,
      totalPrograms,
      totalSchedules,
      recentSchedules: formattedSchedules,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
