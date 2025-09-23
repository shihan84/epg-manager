import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  getTemplateById,
  createScheduleFromTemplate,
} from '@/lib/schedule-templates';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, channelId, startDate, endDate } = body;

    // Validate required fields
    if (!templateId || !channelId || !startDate || !endDate) {
      return NextResponse.json(
        {
          error:
            'Template ID, channel ID, start date, and end date are required',
        },
        { status: 400 }
      );
    }

    // Get the template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
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

    // Create programs for each unique program in the template
    const programMap = new Map<string, string>();

    for (const timeSlot of template.timeSlots) {
      if (!programMap.has(timeSlot.programTitle)) {
        // Check if program already exists
        let existingProgram = await db.program.findFirst({
          where: {
            title: timeSlot.programTitle,
            userId: session.user.id,
          },
        });

        if (!existingProgram) {
          // Create new program
          existingProgram = await db.program.create({
            data: {
              title: timeSlot.programTitle,
              description:
                timeSlot.programDescription ||
                `${timeSlot.programTitle} - Generated from template`,
              category: timeSlot.programCategory || 'Other',
              duration: calculateDuration(timeSlot.startTime, timeSlot.endTime),
              userId: session.user.id,
            },
          });
        }

        programMap.set(timeSlot.programTitle, existingProgram.id);
      }
    }

    // Generate schedules from template
    const schedules = createScheduleFromTemplate(
      template,
      channelId,
      new Date(startDate),
      new Date(endDate)
    );

    // Create schedules in database
    const createdSchedules = [];
    let successCount = 0;
    let errorCount = 0;

    for (const scheduleData of schedules) {
      try {
        // Check for overlapping schedules
        const overlappingSchedule = await db.schedule.findFirst({
          where: {
            channelId: scheduleData.channelId,
            OR: [
              {
                AND: [
                  { startTime: { lte: scheduleData.startTime } },
                  { endTime: { gt: scheduleData.startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: scheduleData.endTime } },
                  { endTime: { gte: scheduleData.endTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: scheduleData.startTime } },
                  { endTime: { lte: scheduleData.endTime } },
                ],
              },
            ],
          },
        });

        if (overlappingSchedule) {
          console.warn(
            `Skipping overlapping schedule: ${scheduleData.programTitle} at ${scheduleData.startTime}`
          );
          errorCount++;
          continue;
        }

        const programId = programMap.get(scheduleData.programTitle);
        if (!programId) {
          errorCount++;
          continue;
        }

        const schedule = await db.schedule.create({
          data: {
            channelId: scheduleData.channelId,
            programId,
            startTime: scheduleData.startTime,
            endTime: scheduleData.endTime,
            isLive: scheduleData.isLive || false,
            isNew: scheduleData.isNew || false,
          },
          include: {
            channel: true,
            program: true,
          },
        });

        createdSchedules.push(schedule);
        successCount++;
      } catch (error) {
        console.error('Error creating schedule:', error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Template applied successfully. Created ${successCount} schedules${errorCount > 0 ? ` (${errorCount} failed due to conflicts)` : ''}`,
      createdSchedules,
      stats: {
        total: schedules.length,
        created: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error('Apply template error:', error);
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    );
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes - startMinutes;
}
