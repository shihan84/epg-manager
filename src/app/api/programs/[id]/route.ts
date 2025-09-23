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
    const program = await db.program.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Get program error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
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
      title,
      description,
      category,
      duration,
      imageUrl,
      thumbnailUrl,
      language,
      region,
    } = body;

    // Check if program exists and belongs to user
    const existingProgram = await db.program.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const program = await db.program.update({
      where: { id },
      data: {
        title,
        description,
        category,
        duration: duration ? parseInt(duration) : null,
        imageUrl,
        thumbnailUrl,
        language: language || existingProgram.language || 'en',
        region: region || existingProgram.region || 'IN',
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Update program error:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
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
    // Check if program exists and belongs to user
    const existingProgram = await db.program.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check if program has schedules
    const schedulesCount = await db.schedule.count({
      where: { programId: id },
    });

    if (schedulesCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete program with existing schedules. Please delete schedules first.',
        },
        { status: 400 }
      );
    }

    await db.program.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Delete program error:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}
