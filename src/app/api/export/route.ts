import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch everything from the database
    const [
      users,
      timetable,
      semesterRecords,
      semesterAttendance,
      subjectMarks,
      courses,
      assignments,
      submissions,
      exams,
      marks,
      messages,
      notifications,
      riskAssessments
    ] = await Promise.all([
      db.user.findMany(),
      db.timetableEntry.findMany(),
      db.semesterRecord.findMany(),
      db.semesterAttendance.findMany(),
      db.subjectMark.findMany(),
      db.course.findMany(),
      db.assignment.findMany(),
      db.assignmentSubmission.findMany(),
      db.exam.findMany(),
      db.mark.findMany(),
      db.message.findMany(),
      db.notification.findMany(),
      db.riskAssessment.findMany()
    ]);

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        timetable: timetable.length,
        courses: courses.length,
        assignments: assignments.length,
      },
      data: {
        users,
        timetable,
        semesterRecords,
        semesterAttendance,
        subjectMarks,
        courses,
        assignments,
        submissions,
        exams,
        marks,
        messages,
        notifications,
        riskAssessments
      }
    };

    return NextResponse.json({
      success: true,
      exportData
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to export database'
    }, { status: 500 });
  }
}
