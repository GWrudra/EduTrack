import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ success: false, message: 'Type is required' }, { status: 400 });
    }

    let deletedCount = 0;

    switch (type) {
      case 'students':
        const studentResult = await db.user.deleteMany({ where: { role: 'student' } });
        deletedCount = studentResult.count;
        break;
      
      case 'faculty':
        const facultyResult = await db.user.deleteMany({ where: { role: 'faculty' } });
        deletedCount = facultyResult.count;
        break;

      case 'marks':
      case 'academic':
        const res1 = await db.subjectMark.deleteMany({});
        const res2 = await db.semesterRecord.deleteMany({});
        const res3 = await db.semesterAttendance.deleteMany({});
        const res4 = await db.mark.deleteMany({});
        // Also cleanup dependent risk/points if marks are gone
        await db.riskAssessment.deleteMany({});
        await db.pointsLedger.deleteMany({});
        deletedCount = res1.count + res2.count + res3.count + res4.count;
        break;

      case 'attendance':
        const attResult = await db.attendanceLog.deleteMany({});
        deletedCount = attResult.count;
        break;

      case 'timetable':
        const ttResult = await db.timetableEntry.deleteMany({});
        deletedCount = ttResult.count;
        break;

      case 'all':
        // Systematic wipe (excluding Admins)
        await db.subjectMark.deleteMany({});
        await db.semesterRecord.deleteMany({});
        await db.semesterAttendance.deleteMany({});
        await db.attendanceLog.deleteMany({});
        await db.timetableEntry.deleteMany({});
        await db.mark.deleteMany({});
        await db.riskAssessment.deleteMany({});
        await db.pointsLedger.deleteMany({});
        const allUsers = await db.user.deleteMany({ where: { role: { in: ['student', 'faculty'] } } });
        deletedCount = allUsers.count;
        break;

      default:
        return NextResponse.json({ success: false, message: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${deletedCount} ${type} records`,
      count: deletedCount
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to cleanup data'
    }, { status: 500 });
  }
}
