import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, date, attendanceData, topicCovered } = body;

    if (!courseId || !date || !attendanceData) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const attendanceDate = new Date(date);

    // Process attendance data (Format: { studentId: 'present' | 'absent' | 'late' })
    const studentIds = Object.keys(attendanceData);
    let saved = 0;

    for (const sid of studentIds) {
      const status = attendanceData[sid];

      // Upsert daily attendance log
      const existingLog = await db.attendanceLog.findFirst({
        where: {
          studentId: sid,
          date: attendanceDate,
          subject: courseId
        }
      });

      // Embed topic into subject field to avoid schema lock issues
      const finalSubject = topicCovered ? `${courseId} | TOPIC: ${topicCovered}` : courseId;

      if (existingLog) {
        await db.attendanceLog.update({
          where: { id: existingLog.id },
          data: { status }
        });
      } else {
        await db.attendanceLog.create({
          data: {
            studentId: sid,
            subject: finalSubject,
            status,
            date: attendanceDate
          }
        });
      }

      // Update semesterAttendance so student dashboard reflects the change immediately
      // Try to find existing record by subjectCode OR subjectName matching courseId
      const existingSemAtt = await db.semesterAttendance.findFirst({
        where: {
          studentId: sid,
          OR: [
            { subjectCode: courseId },
            { subjectName: courseId }
          ]
        }
      });

      const isPresent = status === 'present' || status === 'late';
      let incrementAttended = isPresent ? 1 : 0;
      const incrementTotal = existingLog ? 0 : 1;

      if (existingLog) {
        const wasPresent = existingLog.status === 'present' || existingLog.status === 'late';
        if (!wasPresent && isPresent) incrementAttended = 1;
        else if (wasPresent && !isPresent) incrementAttended = -1;
        else incrementAttended = 0;
      }

      if (existingSemAtt) {
        const newTotal = existingSemAtt.totalClasses + incrementTotal;
        const newAttended = Math.max(0, existingSemAtt.attended + incrementAttended);
        const newPercentage = newTotal > 0 ? (newAttended / newTotal) * 100 : 0;

        await db.semesterAttendance.update({
          where: { id: existingSemAtt.id },
          data: {
            totalClasses: newTotal,
            attended: newAttended,
            percentage: Math.round(newPercentage * 10) / 10
          }
        });
      } else if (incrementTotal > 0) {
        // Create new record if it doesn't exist
        await db.semesterAttendance.create({
          data: {
            studentId: sid,
            subjectCode: courseId.includes(' | ') ? courseId.split(' | ')[0] : courseId,
            subjectName: courseId.includes(' | ') ? courseId.split(' | ')[0] : courseId,
            semester: 1, // Fallback
            totalClasses: 1,
            attended: incrementAttended > 0 ? 1 : 0,
            percentage: incrementAttended > 0 ? 100 : 0,
            academicYear: '2024-25'
          }
        });
      }

      saved++;
    }

    return NextResponse.json({
      success: true,
      message: `Attendance saved for ${saved} students`
    });

  } catch (error) {
    console.error('Save attendance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save attendance'
    }, { status: 500 });
  }
}

// DELETE attendance records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!courseId && !studentId) {
      return NextResponse.json({
        success: false,
        message: 'At least courseId or studentId is required'
      }, { status: 400 });
    }

    // Build the where clause based on provided params
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.subject = courseId;
    if (date) where.date = new Date(date);

    const deleted = await db.attendanceLog.deleteMany({ where });

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} attendance record(s)`,
      count: deleted.count
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete attendance'
    }, { status: 500 });
  }
}
