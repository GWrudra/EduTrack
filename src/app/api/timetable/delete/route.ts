import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const semesterStr = searchParams.get('semester');
    const semester = semesterStr && semesterStr !== 'null' ? parseInt(semesterStr) : null;

    if (!section) {
      return NextResponse.json({ success: false, message: 'Section is required' }, { status: 400 });
    }

    const where: any = { section: section };
    if (semester !== undefined) {
      where.semester = semester;
    }

    const result = await db.timetableEntry.deleteMany({
      where: where
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} entries for ${section}${semester ? ` (Sem ${semester})` : ''}`
    });

  } catch (error: any) {
    console.error('Delete timetable error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete timetable'
    }, { status: 500 });
  }
}
