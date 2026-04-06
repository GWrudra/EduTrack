import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ success: false, message: 'No CSV data provided' }, { status: 400 });
    }

    const normalized = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.trim().split('\n');
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'CSV file is empty or missing headers' }, { status: 400 });
    }

    const rawHeader = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
    const records = lines.slice(1).filter((l: string) => l.trim() !== '');

    const results = {
      total: records.length,
      success: 0,
      errors: 0,
      details: [] as any[]
    };

    // Index mapping for robust parsing
    const findIndex = (aliases: string[]) => rawHeader.findIndex(h => aliases.some(a => h.includes(a)));
    const sIndex = findIndex(['collegeid', 'rollno', 'userid', 'student']);
    const dIndex = findIndex(['date', 'day']);
    const subIndex = findIndex(['subject', 'course', 'sub']);
    const stIndex = findIndex(['status', 'attendance', 'att']);
    const tIndex = findIndex(['topic', 'content', 'covered']);

    if (sIndex === -1 || dIndex === -1 || subIndex === -1 || stIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: `Missing required columns. Header found: [${rawHeader.join(', ')}]. Required: collegeId, date, subject, status.` 
      }, { status: 400 });
    }

    for (const line of records) {
      const values = line.split(',').map(v => v.trim());
      if (values.length < 4) continue;

      const collegeid = values[sIndex];
      const date = values[dIndex];
      const subject = values[subIndex];
      const status = values[stIndex];
      const topiccovered = tIndex !== -1 ? values[tIndex] : '';

      if (!collegeid || !date || !subject || !status) {
        results.errors++;
        results.details.push({ collegeid: collegeid || 'N/A', error: 'Missing required field in this row' });
        continue;
      }

      try {
        // Find student by collegeId
        const student = await db.user.findUnique({
          where: { collegeId: collegeid }
        });

        if (!student) {
          results.errors++;
          results.details.push({ collegeid, error: `Student with ID "${collegeid}" not found in database` });
          continue;
        }

        const attendanceDate = new Date(date);
        if (isNaN(attendanceDate.getTime())) {
          results.errors++;
          results.details.push({ collegeid, error: `Invalid date format: "${date}". Use YYYY-MM-DD.` });
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
        const isPresent = status.toLowerCase().includes('pres') || status.toLowerCase().includes('late') || status.toUpperCase() === 'P';
        
        const existingSemAtt = await db.semesterAttendance.findFirst({
          where: {
            studentId: student.id,
            OR: [
              { subjectCode: subject },
              { subjectName: subject }
            ]
          }
        });

        if (existingSemAtt) {
          const newTotal = existingSemAtt.totalClasses + 1;
          const newAttended = existingSemAtt.attended + (isPresent ? 1 : 0);
          const newPercentage = (newAttended / newTotal) * 100;

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
      message: `Processed ${results.success} records successfully, ${results.errors} failures.`,
      results
    });

  } catch (error: any) {
    console.error('Attendance import error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
