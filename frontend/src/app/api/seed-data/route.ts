import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Sample subjects for different branches and semesters
const subjectData: Record<string, Record<number, { code: string; name: string; credits: number }[]>> = {
  'CSE': {
    1: [
      { code: 'CS101', name: 'Programming Fundamentals', credits: 3 },
      { code: 'CS102', name: 'Digital Logic Design', credits: 3 },
      { code: 'MA101', name: 'Mathematics I', credits: 3 },
      { code: 'PH101', name: 'Physics', credits: 3 },
      { code: 'EN101', name: 'English', credits: 2 },
    ],
    2: [
      { code: 'CS201', name: 'Data Structures', credits: 3 },
      { code: 'CS202', name: 'Computer Organization', credits: 3 },
      { code: 'MA201', name: 'Mathematics II', credits: 3 },
      { code: 'CS203', name: 'Object-Oriented Programming', credits: 3 },
      { code: 'CS204', name: 'Discrete Mathematics', credits: 3 },
    ],
    3: [
      { code: 'CS301', name: 'Database Management Systems', credits: 3 },
      { code: 'CS302', name: 'Operating Systems', credits: 3 },
      { code: 'CS303', name: 'Computer Networks', credits: 3 },
      { code: 'CS304', name: 'Software Engineering', credits: 3 },
      { code: 'CS305', name: 'Design & Analysis of Algorithms', credits: 3 },
    ],
    4: [
      { code: 'CS401', name: 'Web Technologies', credits: 3 },
      { code: 'CS402', name: 'Artificial Intelligence', credits: 3 },
      { code: 'CS403', name: 'Machine Learning', credits: 3 },
      { code: 'CS404', name: 'Compiler Design', credits: 3 },
      { code: 'CS405', name: 'Distributed Systems', credits: 3 },
    ],
    5: [
      { code: 'CS501', name: 'Cloud Computing', credits: 3 },
      { code: 'CS502', name: 'Cyber Security', credits: 3 },
      { code: 'CS503', name: 'Big Data Analytics', credits: 3 },
      { code: 'CS504', name: 'Mobile App Development', credits: 3 },
      { code: 'CS505', name: 'Deep Learning', credits: 3 },
    ],
  },
  'ECE': {
    1: [
      { code: 'EC101', name: 'Basic Electronics', credits: 3 },
      { code: 'EC102', name: 'Circuit Theory', credits: 3 },
      { code: 'MA101', name: 'Mathematics I', credits: 3 },
      { code: 'PH101', name: 'Physics', credits: 3 },
      { code: 'EN101', name: 'English', credits: 2 },
    ],
    2: [
      { code: 'EC201', name: 'Signals and Systems', credits: 3 },
      { code: 'EC202', name: 'Electronic Devices', credits: 3 },
      { code: 'MA201', name: 'Mathematics II', credits: 3 },
      { code: 'EC203', name: 'Network Analysis', credits: 3 },
      { code: 'EC204', name: 'Analog Circuits', credits: 3 },
    ],
    3: [
      { code: 'EC301', name: 'Digital Communication', credits: 3 },
      { code: 'EC302', name: 'Microprocessors', credits: 3 },
      { code: 'EC303', name: 'Control Systems', credits: 3 },
      { code: 'EC304', name: 'Electromagnetic Theory', credits: 3 },
      { code: 'EC305', name: 'VLSI Design', credits: 3 },
    ],
  },
  'ME': {
    1: [
      { code: 'ME101', name: 'Engineering Mechanics', credits: 3 },
      { code: 'ME102', name: 'Thermodynamics', credits: 3 },
      { code: 'MA101', name: 'Mathematics I', credits: 3 },
      { code: 'PH101', name: 'Physics', credits: 3 },
      { code: 'EN101', name: 'English', credits: 2 },
    ],
    2: [
      { code: 'ME201', name: 'Strength of Materials', credits: 3 },
      { code: 'ME202', name: 'Fluid Mechanics', credits: 3 },
      { code: 'MA201', name: 'Mathematics II', credits: 3 },
      { code: 'ME203', name: 'Manufacturing Processes', credits: 3 },
      { code: 'ME204', name: 'Machine Drawing', credits: 3 },
    ],
    3: [
      { code: 'ME301', name: 'Heat Transfer', credits: 3 },
      { code: 'ME302', name: 'Theory of Machines', credits: 3 },
      { code: 'ME303', name: 'Machine Design', credits: 3 },
      { code: 'ME304', name: 'Production Technology', credits: 3 },
      { code: 'ME305', name: 'Internal Combustion Engines', credits: 3 },
    ],
  },
};

// Generate random attendance percentage (60-95% range with some variation)
function generateAttendance(basePercentage: number): { totalClasses: number; attended: number; percentage: number } {
  const totalClasses = 40 + Math.floor(Math.random() * 20); // 40-60 classes
  const variation = (Math.random() - 0.5) * 20; // -10 to +10
  const targetPercentage = Math.max(50, Math.min(98, basePercentage + variation));
  const attended = Math.round(totalClasses * targetPercentage / 100);
  const percentage = Math.round((attended / totalClasses) * 100 * 10) / 10;
  return { totalClasses, attended, percentage };
}

// Generate random marks and grade
function generateMarks(): { internal: number; external: number; total: number; grade: string; gradePoints: number } {
  const internal = 15 + Math.floor(Math.random() * 25); // 15-40 out of 40
  const external = 30 + Math.floor(Math.random() * 50); // 30-80 out of 60
  const total = internal + external;
  
  let grade: string;
  let gradePoints: number;
  
  if (total >= 90) { grade = 'A+'; gradePoints = 10; }
  else if (total >= 80) { grade = 'A'; gradePoints = 9; }
  else if (total >= 70) { grade = 'B+'; gradePoints = 8; }
  else if (total >= 60) { grade = 'B'; gradePoints = 7; }
  else if (total >= 50) { grade = 'C'; gradePoints = 6; }
  else if (total >= 40) { grade = 'D'; gradePoints = 5; }
  else { grade = 'F'; gradePoints = 0; }
  
  return { internal, external, total, grade, gradePoints };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'seed') {
      // Get all students
      const students = await db.user.findMany({
        where: { role: 'student' }
      });
      
      if (students.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No students found. Please import students first.'
        }, { status: 400 });
      }
      
      const currentAcademicYear = '2024-25';
      const previousAcademicYear = '2023-24';
      
      let attendanceCreated = 0;
      let recordsCreated = 0;
      let marksCreated = 0;
      
      for (const student of students) {
        const branch = student.branch || 'CSE';
        const branchSubjects = subjectData[branch] || subjectData['CSE'];
        
        // Determine which semesters to create data for (current and previous)
        const currentSemester = (student.year || 1) * 2 - 1; // Odd semester of current year
        const previousSemester = currentSemester - 1 > 0 ? currentSemester - 1 : null;
        
        // Base attendance percentage varies by student
        const baseAttendance = 70 + Math.random() * 20; // 70-90% base
        
        // Process current semester
        const currentSemSubjects = branchSubjects[currentSemester] || branchSubjects[1];
        if (currentSemSubjects) {
          for (const subject of currentSemSubjects) {
            // Check if already exists
            const existing = await db.semesterAttendance.findUnique({
              where: {
                studentId_semester_subjectCode: {
                  studentId: student.id,
                  semester: currentSemester,
                  subjectCode: subject.code
                }
              }
            });
            
            if (!existing) {
              const att = generateAttendance(baseAttendance);
              await db.semesterAttendance.create({
                data: {
                  studentId: student.id,
                  semester: currentSemester,
                  subjectCode: subject.code,
                  subjectName: subject.name,
                  totalClasses: att.totalClasses,
                  attended: att.attended,
                  percentage: att.percentage,
                  academicYear: currentAcademicYear
                }
              });
              attendanceCreated++;
              
              // Create subject marks
              const marks = generateMarks();
              await db.subjectMark.create({
                data: {
                  studentId: student.id,
                  semester: currentSemester,
                  subjectCode: subject.code,
                  subjectName: subject.name,
                  credits: subject.credits,
                  internalMarks: marks.internal,
                  externalMarks: marks.external,
                  totalMarks: marks.total,
                  grade: marks.grade,
                  gradePoints: marks.gradePoints,
                  academicYear: currentAcademicYear
                }
              });
              marksCreated++;
            }
          }
          
          // Create semester record (SGPA/CGPA)
          const existingRecord = await db.semesterRecord.findUnique({
            where: {
              studentId_semester: {
                studentId: student.id,
                semester: currentSemester
              }
            }
          });
          
          if (!existingRecord) {
            const sgpa = 6 + Math.random() * 3; // 6-9 SGPA
            await db.semesterRecord.create({
              data: {
                studentId: student.id,
                semester: currentSemester,
                sgpa: Math.round(sgpa * 100) / 100,
                cgpa: Math.round(sgpa * 100) / 100,
                creditsEarned: currentSemSubjects.reduce((sum, s) => sum + s.credits, 0),
                creditsTotal: currentSemSubjects.reduce((sum, s) => sum + s.credits, 0),
                academicYear: currentAcademicYear
              }
            });
            recordsCreated++;
          }
        }
        
        // Process previous semester if exists
        if (previousSemester && previousSemester > 0) {
          const prevSemSubjects = branchSubjects[previousSemester] || branchSubjects[1];
          if (prevSemSubjects) {
            for (const subject of prevSemSubjects) {
              const existing = await db.semesterAttendance.findUnique({
                where: {
                  studentId_semester_subjectCode: {
                    studentId: student.id,
                    semester: previousSemester,
                    subjectCode: subject.code
                  }
                }
              });
              
              if (!existing) {
                const att = generateAttendance(baseAttendance - 5); // Slightly lower for previous sem
                await db.semesterAttendance.create({
                  data: {
                    studentId: student.id,
                    semester: previousSemester,
                    subjectCode: subject.code,
                    subjectName: subject.name,
                    totalClasses: att.totalClasses,
                    attended: att.attended,
                    percentage: att.percentage,
                    academicYear: previousAcademicYear
                  }
                });
                attendanceCreated++;
                
                const marks = generateMarks();
                await db.subjectMark.create({
                  data: {
                    studentId: student.id,
                    semester: previousSemester,
                    subjectCode: subject.code,
                    subjectName: subject.name,
                    credits: subject.credits,
                    internalMarks: marks.internal,
                    externalMarks: marks.external,
                    totalMarks: marks.total,
                    grade: marks.grade,
                    gradePoints: marks.gradePoints,
                    academicYear: previousAcademicYear
                  }
                });
                marksCreated++;
              }
            }
            
            const existingRecord = await db.semesterRecord.findUnique({
              where: {
                studentId_semester: {
                  studentId: student.id,
                  semester: previousSemester
                }
              }
            });
            
            if (!existingRecord) {
              const sgpa = 5.5 + Math.random() * 3.5;
              await db.semesterRecord.create({
                data: {
                  studentId: student.id,
                  semester: previousSemester,
                  sgpa: Math.round(sgpa * 100) / 100,
                  cgpa: Math.round(sgpa * 100) / 100,
                  creditsEarned: prevSemSubjects.reduce((sum, s) => sum + s.credits, 0),
                  creditsTotal: prevSemSubjects.reduce((sum, s) => sum + s.credits, 0),
                  academicYear: previousAcademicYear
                }
              });
              recordsCreated++;
            }
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Created ${attendanceCreated} attendance records, ${marksCreated} subject marks, and ${recordsCreated} semester records for ${students.length} students`
      });
    }
    
    if (action === 'cleanup') {
      // Remove data older than 2 semesters
      const students = await db.user.findMany({
        where: { role: 'student' }
      });
      
      let removed = { attendance: 0, records: 0, marks: 0 };
      
      for (const student of students) {
        const currentSemester = (student.year || 1) * 2 - 1;
        const minSemester = Math.max(1, currentSemester - 1); // Keep only current and previous
        
        // Delete older semester attendance
        const delAtt = await db.semesterAttendance.deleteMany({
          where: {
            studentId: student.id,
            semester: { lt: minSemester }
          }
        });
        removed.attendance += delAtt.count;
        
        // Delete older semester records
        const delRec = await db.semesterRecord.deleteMany({
          where: {
            studentId: student.id,
            semester: { lt: minSemester }
          }
        });
        removed.records += delRec.count;
        
        // Delete older subject marks
        const delMarks = await db.subjectMark.deleteMany({
          where: {
            studentId: student.id,
            semester: { lt: minSemester }
          }
        });
        removed.marks += delMarks.count;
      }
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${removed.attendance} attendance records, ${removed.records} semester records, and ${removed.marks} subject marks older than 2 semesters`
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use "seed" or "cleanup"'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Seed data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process seed data';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
