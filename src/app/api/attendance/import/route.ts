import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ success: false, message: 'No CSV data provided' }, { status: 400 });
    }

    const lines = data.split('\n');
    const header = lines[0].toLowerCase().split(',');
    const records = lines.slice(1).filter((l: string) => l.trim() !== '');

    const results = {
      total: records.length,
      success: 0,
      errors: 0,
      details: [] as any[]
    };

    for (const line of records) {
      const values = line.split(',');
      const record: any = {};
      header.forEach((h: string, i: number) => {
        record[h.trim()] = values[i]?.trim();
      });

      const { collegeid, date, subject, status, topiccovered } = record;

      if (!collegeid || !date || !subject || !status) {
        results.errors++;
        results.details.push({ collegeid: collegeid || 'N/A', error: 'Missing required fields' });
        continue;
      }

      try {
        // Find student by collegeId
        const student = await db.user.findUnique({
          where: { collegeId: collegeid }
        });

        if (!student) {
          results.errors++;
          results.details.push({ collegeid, error: 'Student not found' });
          continue;
        }

        const attendanceDate = new Date(date);
        if (isNaN(attendanceDate.getTime())) {
          results.errors++;
          results.details.push({ collegeid, error: 'Invalid date format' });
          continue;
        }

        // Upsert attendance log
        const existingLog = await db.attendanceLog.findFirst({
          where: {
            studentId: student.id,
            date: attendanceDate,
            subject: subject 
          }
        });

        if (existingLog) {
          await db.attendanceLog.update({
            where: { id: existingLog.id },
            data: { 
              status, 
              topicCovered: topiccovered || undefined 
            }
          });
        } else {
          await db.attendanceLog.create({
            data: {
              studentId: student.id,
              subject: subject,
              status,
              date: attendanceDate,
              topicCovered: topiccovered || ''
            }
          });
        }

        // Update semesterAttendance (summary table)
        const isPresent = status.toLowerCase() === 'present' || status.toLowerCase() === 'late' || status.toUpperCase() === 'P';
        const finalStatus = isPresent ? 'present' : 'absent';
        
        const existingSemAtt = await db.semesterAttendance.findFirst({
          where: {
            studentId: student.id,
            OR: [
              { subjectCode: subject },
              { subjectName: subject }
            ]
          }
        });

        const incrementAttended = isPresent ? 1 : 0;
        const incrementTotal = 1;

        if (existingSemAtt) {
          const newTotal = existingSemAtt.totalClasses + incrementTotal;
          const newAttended = Math.max(0, existingSemAtt.attended + (isPresent ? 1 : 0));
          const newPercentage = newTotal > 0 ? (newAttended / newTotal) * 100 : 0;

          await db.semesterAttendance.update({
            where: { id: existingSemAtt.id },
            data: {
              totalClasses: newTotal,
              attended: newAttended,
              percentage: Math.round(newPercentage * 10) / 10
            }
          });
        } else {
          await db.semesterAttendance.create({
            data: {
              studentId: student.id,
              subjectCode: subject,
              subjectName: subject,
              semester: student.year ? student.year * 2 : 1,
              totalClasses: 1,
              attended: isPresent ? 1 : 0,
              percentage: isPresent ? 100 : 0,
              academicYear: '2024-25'
            }
          });
        }

        results.success++;
      } catch (err: any) {
        results.errors++;
        results.details.push({ collegeid, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.success} attendance records.`,
      results
    });

  } catch (error: any) {
    console.error('Attendance import error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
