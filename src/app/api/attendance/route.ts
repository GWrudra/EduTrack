import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, date, attendanceData } = body;

    if (!courseId || !date || !attendanceData) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    const attendanceDate = new Date(date);

    // Process attendance data (Format: { studentId: 'present' | 'absent' | 'late' })
    const studentIds = Object.keys(attendanceData);
    
    for (const sid of studentIds) {
      const status = attendanceData[sid];
      
      // Upsert daily attendance log for consecutive days logic
      const existingLog = await db.attendanceLog.findFirst({
        where: {
          studentId: sid,
          date: attendanceDate,
          subject: courseId
        }
      });

      if (existingLog) {
        await db.attendanceLog.update({
          where: { id: existingLog.id },
          data: { status }
        });
      } else {
        await db.attendanceLog.create({
          data: {
            studentId: sid,
            subject: courseId,
            status,
            date: attendanceDate
          }
        });
      }

      // Also update semester attendance aggregates to maintain percentages
      let percentageVal = status === 'present' ? 100 : status === 'late' ? 50 : 0;
      
      const existingSemAtt = await db.semesterAttendance.findFirst({
        where: { studentId: sid, subjectCode: courseId }
      });

      if (existingSemAtt) {
         await db.semesterAttendance.update({
           where: { id: existingSemAtt.id },
           data: {
             percentage: (existingSemAtt.percentage + percentageVal) / 2
           }
         });
      } else {
         await db.semesterAttendance.create({
           data: {
             studentId: sid,
             semester: 1,
             subjectCode: courseId,
             subjectName: 'Course Attendance',
             academicYear: '2023-2024',
             percentage: percentageVal
           }
         });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance saved successfully'
    });

  } catch (error) {
    console.error('Save attendance error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save attendance'
    }, { status: 500 });
  }
}
