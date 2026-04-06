import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (!type || !['students', 'faculty', 'all'].includes(type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid type. Must be "students", "faculty", or "all"'
      }, { status: 400 });
    }

    let deletedCount = 0;

    if (type === 'students') {
      const result = await db.user.deleteMany({
        where: { role: 'student' }
      });
      deletedCount = result.count;
    } else if (type === 'faculty') {
      const result = await db.user.deleteMany({
        where: { role: 'faculty' }
      });
      deletedCount = result.count;
    } else if (type === 'all') {
      // Delete all non-admin users
      const result = await db.user.deleteMany({
        where: {
          role: { in: ['student', 'faculty'] }
        }
      });
      deletedCount = result.count;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} ${type === 'all' ? 'users' : type}`,
      deletedCount
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete data'
    }, { status: 500 });
  }
}
