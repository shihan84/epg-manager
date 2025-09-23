import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  COMMON_SCHEDULE_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByPattern,
} from '@/lib/schedule-templates';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const pattern = searchParams.get('pattern');
    const id = searchParams.get('id');

    let templates = COMMON_SCHEDULE_TEMPLATES;

    if (id) {
      const template = getTemplateById(id);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(template);
    }

    if (category) {
      templates = getTemplatesByCategory(category);
    }

    if (pattern) {
      templates = templates.filter(template => template.pattern === pattern);
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Get schedule templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule templates' },
      { status: 500 }
    );
  }
}
