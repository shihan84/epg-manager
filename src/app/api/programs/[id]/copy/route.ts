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
    const { newTitle } = body;

    // Get the original program
    const originalProgram = await db.program.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!originalProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Create a copy of the program
    const copiedProgram = await db.program.create({
      data: {
        title: newTitle || `${originalProgram.title} (Copy)`,
        description: originalProgram.description,
        category: originalProgram.category,
        duration: originalProgram.duration,
        imageUrl: originalProgram.imageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(copiedProgram, { status: 201 });
  } catch (error) {
    console.error('Copy program error:', error);
    return NextResponse.json(
      { error: 'Failed to copy program' },
      { status: 500 }
    );
  }
}
