import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { hours } = await request.json();
    
    if (!hours || isNaN(hours)) {
      return NextResponse.json({ success: false, message: 'Invalid hours provided' }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    // Delete users created after the cutoff date, excluding admins
    const deletedCount = await db.user.deleteMany({
      where: {
        createdAt: {
          gte: cutoffDate
        },
        role: {
          not: 'admin'
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount.count} users created in the last ${hours} hour(s).`
    });
  } catch (error) {
    console.error('Error deleting recent users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete recent users'
    }, { status: 500 });
  }
}
