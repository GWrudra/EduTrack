import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch timetable entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const dayOfWeek = searchParams.get('day');

    const where: any = {};

    if (section && section !== 'all') {
      where.section = section;
    }

    if (dayOfWeek && dayOfWeek !== 'all') {
      where.dayOfWeek = parseInt(dayOfWeek);
    }

    const entries = await db.timetableEntry.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Get unique sections
    const sections = await db.timetableEntry.findMany({
      distinct: ['section'],
      select: { section: true },
      orderBy: { section: 'asc' }
    });

    return NextResponse.json({
      success: true,
      entries,
      sections: sections.map(s => s.section)
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch timetable'
    }, { status: 500 });
  }
}

// DELETE: Clear all timetable entries
export async function DELETE(request: NextRequest) {
  try {
    const result = await db.timetableEntry.deleteMany();
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} timetable entries`
    });
  } catch (error) {
    console.error('Error clearing timetable:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to clear timetable'
    }, { status: 500 });
  }
}
