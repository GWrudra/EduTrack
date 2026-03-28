import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function getGradePoints(grade: string): number {
  if (!grade) return 0;
  grade = grade.toUpperCase().trim();
  if (grade === 'O' || grade === 'A+') return 10;
  if (grade === 'A') return 9;
  if (grade === 'B+') return 8;
  if (grade === 'B') return 7;
  if (grade === 'C+') return 6;
  if (grade === 'C') return 5;
  if (grade.startsWith('F')) return 0; // handles F(Th), F(P), F etc.
  return 8; // fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ success: false, message: 'No CSV data provided' }, { status: 400 });
    }

    // Basic CSV parsing
    const lines = data.split('\n').map((line: string) => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'Invalid or empty CSV' }, { status: 400 });
    }

    const rawHeaders = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
    // Normalize headers by stripping spaces and removing special characters for mapping
    const headers = rawHeaders.map(h => h.replace(/[^a-z0-9]/g, ''));
    
    const sIndex = headers.findIndex(h => h.includes('collegeid') || h === 'userid' || h === 'rollno');
    const scIndex = headers.findIndex(h => h.includes('subjectcode') || h === 'code');
    const snIndex = headers.findIndex(h => h.includes('subjectname') || h === 'name');
    const crIndex = headers.findIndex(h => h.includes('credit'));
    const grIndex = headers.findIndex(h => h.includes('grade'));
    const semIndex = headers.findIndex(h => h.includes('sem'));

    if (sIndex === -1 || scIndex === -1 || grIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required columns. Ensure collegeId, Subject Code, and Grade are present.' 
      }, { status: 400 });
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    // Find all mapping up front
    const collegeIdsToSearch = lines.slice(1).map((line: string) => line.split(',')[sIndex]?.trim()).filter(Boolean);
    const students = await db.user.findMany({
      where: { collegeId: { in: collegeIdsToSearch }, role: 'student' },
      select: { id: true, collegeId: true, semester: true, year: true }
    });
    
    const studentMap = new Map(students.map((s: any) => [s.collegeId, s]));

    // Group subjects by student to calculate SGPA dynamically
    const studentSemestersToUpdate = new Map<string, number>();

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c: string) => c.trim());
      if (cols.length < rawHeaders.length) continue;

      const collegeId = cols[sIndex];
      const semStr = semIndex !== -1 ? cols[semIndex] : '';

      const student = studentMap.get(collegeId);
      if (!student) {
        results.failed++;
        results.errors.push(`Row ${i}: Student ${collegeId} not found`);
        continue;
      }

      const targetSemester = semStr ? parseInt(semStr) : (student.semester || (student.year ? student.year * 2 : 1));
      
      const subjectCode = cols[scIndex];
      const subjectName = snIndex !== -1 ? cols[snIndex] : subjectCode;
      const creditStr = crIndex !== -1 ? cols[crIndex] : '3';
      const grade = cols[grIndex];
      
      if (!subjectCode || !grade) {
         results.failed++;
         results.errors.push(`Row ${i}: Missing subjectCode or grade`);
         continue;
      }

      const credits = parseInt(creditStr) || 3;
      const gradePoints = getGradePoints(grade);

      try {
        await db.subjectMark.upsert({
          where: {
            studentId_semester_subjectCode: {
              studentId: student.id,
              semester: targetSemester,
              subjectCode: subjectCode
            }
          },
          update: {
            subjectName,
            grade,
            gradePoints,
            credits,
            totalMarks: gradePoints * 10,
          },
          create: {
            studentId: student.id,
            semester: targetSemester,
            subjectCode,
            subjectName,
            grade,
            gradePoints,
            credits,
            totalMarks: gradePoints * 10,
            academicYear: '2024-25',
          }
        });

        // Mark this student's semester to recalculate their SGPA at the end
        studentSemestersToUpdate.set(`${student.id}_${targetSemester}`, targetSemester);
        
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row ${i}: Failed to save record for ${collegeId}`);
      }
    }

    // Now recalculate SGPA for all touched student semesters
    for (const [key, semester] of studentSemestersToUpdate) {
      const studentId = key.split('_')[0];
      const marks = await db.subjectMark.findMany({
        where: { studentId, semester }
      });
      
      let totalEarned = 0;
      let totalCredits = 0;
      
      marks.forEach((m: any) => {
        totalCredits += m.credits;
        totalEarned += (m.gradePoints * m.credits);
      });
      
      const sgpa = totalCredits > 0 ? parseFloat((totalEarned / totalCredits).toFixed(2)) : 0;
      
      await db.semesterRecord.upsert({
        where: {
          studentId_semester: {
            studentId,
            semester
          }
        },
        update: {
          sgpa,
          cgpa: sgpa, // Simple approximation, would need all semesters to be perfect
          creditsEarned: totalCredits,
          creditsTotal: totalCredits
        },
        create: {
          studentId,
          semester,
          sgpa,
          cgpa: sgpa,
          creditsEarned: totalCredits,
          creditsTotal: totalCredits,
          academicYear: '2024-25'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed Subject Marks CSV. Success: ${results.success}, Failed: ${results.failed}`,
      results
    });
    
  } catch (error) {
    console.error('Academic CSV Import error:', error);
    return NextResponse.json({ success: false, message: 'Failed to import CSV' }, { status: 500 });
  }
}
