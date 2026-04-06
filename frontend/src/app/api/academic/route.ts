import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Seed academic records for all students
export async function POST(request: NextRequest) {
  try {
    // Get all students
    const students = await db.user.findMany({
      where: { role: 'student' }
    });

    if (students.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No students found to seed data'
      }, { status: 400 });
    }

    // Clear existing academic records before seeding to avoid stale data (like Sem 4048)
    await db.$transaction([
      db.semesterRecord.deleteMany({}),
      db.semesterAttendance.deleteMany({}),
      db.subjectMark.deleteMany({})
    ]);

    // Define subjects for different branches and semesters
    const subjectTemplates: Record<string, Record<number, { code: string; name: string; credits: number }[]>> = {
      'CSE': {
        3: [
          { code: 'CSE-301', name: 'Database Management Systems', credits: 4 },
          { code: 'CSE-302', name: 'Design and Analysis of Algorithm', credits: 4 },
          { code: 'CSE-303', name: 'Digital Logic Design', credits: 3 },
          { code: 'MTH-301', name: 'Probability and Statistics', credits: 3 },
          { code: 'CSE-304', name: 'Python Programming', credits: 3 },
          { code: 'CSE-305', name: 'DBMS Lab', credits: 1 },
          { code: 'CSE-306', name: 'DAA Lab', credits: 1 },
        ],
        4: [
          { code: 'CSE-401', name: 'Computer Organization and Architecture', credits: 4 },
          { code: 'CSE-402', name: 'Operating Systems', credits: 4 },
          { code: 'CSE-403', name: 'Discrete Mathematics', credits: 3 },
          { code: 'CSE-404', name: 'Artificial Intelligence Tools', credits: 3 },
          { code: 'MGT-401', name: 'Organizational Behaviour', credits: 2 },
          { code: 'CSE-405', name: 'COA Lab', credits: 1 },
          { code: 'CSE-406', name: 'OS Lab', credits: 1 },
        ],
      },
      'ECE': {
        3: [
          { code: 'ECE-301', name: 'Signals and Systems', credits: 4 },
          { code: 'ECE-302', name: 'Analog Electronics', credits: 4 },
          { code: 'ECE-303', name: 'Digital Communication', credits: 3 },
          { code: 'MTH-301', name: 'Probability and Statistics', credits: 3 },
          { code: 'ECE-304', name: 'VLSI Design', credits: 3 },
          { code: 'ECE-305', name: 'Signals Lab', credits: 1 },
          { code: 'ECE-306', name: 'Analog Lab', credits: 1 },
        ],
        4: [
          { code: 'ECE-401', name: 'Microprocessors', credits: 4 },
          { code: 'ECE-402', name: 'Control Systems', credits: 4 },
          { code: 'ECE-403', name: 'Communication Systems', credits: 3 },
          { code: 'ECE-404', name: 'Embedded Systems', credits: 3 },
          { code: 'MGT-401', name: 'Organizational Behaviour', credits: 2 },
          { code: 'ECE-405', name: 'Microprocessor Lab', credits: 1 },
          { code: 'ECE-406', name: 'Control Lab', credits: 1 },
        ],
      },
      'IT': {
        3: [
          { code: 'IT-301', name: 'Data Structures', credits: 4 },
          { code: 'IT-302', name: 'Computer Networks', credits: 4 },
          { code: 'IT-303', name: 'Software Engineering', credits: 3 },
          { code: 'MTH-301', name: 'Probability and Statistics', credits: 3 },
          { code: 'IT-304', name: 'Web Technologies', credits: 3 },
          { code: 'IT-305', name: 'DS Lab', credits: 1 },
          { code: 'IT-306', name: 'CN Lab', credits: 1 },
        ],
        4: [
          { code: 'IT-401', name: 'Cloud Computing', credits: 4 },
          { code: 'IT-402', name: 'Machine Learning', credits: 4 },
          { code: 'IT-403', name: 'Cryptography', credits: 3 },
          { code: 'IT-404', name: 'Mobile Computing', credits: 3 },
          { code: 'MGT-401', name: 'Organizational Behaviour', credits: 2 },
          { code: 'IT-405', name: 'Cloud Lab', credits: 1 },
          { code: 'IT-406', name: 'ML Lab', credits: 1 },
        ],
      },
      'ME': {
        3: [
          { code: 'ME-301', name: 'Thermodynamics', credits: 4 },
          { code: 'ME-302', name: 'Fluid Mechanics', credits: 4 },
          { code: 'ME-303', name: 'Manufacturing Process', credits: 3 },
          { code: 'MTH-301', name: 'Probability and Statistics', credits: 3 },
          { code: 'ME-304', name: 'Machine Design', credits: 3 },
          { code: 'ME-305', name: 'Thermo Lab', credits: 1 },
          { code: 'ME-306', name: 'Fluid Lab', credits: 1 },
        ],
        4: [
          { code: 'ME-401', name: 'Heat Transfer', credits: 4 },
          { code: 'ME-402', name: 'CAD/CAM', credits: 4 },
          { code: 'ME-403', name: 'Mechanical Vibrations', credits: 3 },
          { code: 'ME-404', name: 'Production Planning', credits: 3 },
          { code: 'MGT-401', name: 'Organizational Behaviour', credits: 2 },
          { code: 'ME-405', name: 'Heat Transfer Lab', credits: 1 },
          { code: 'ME-406', name: 'CAD Lab', credits: 1 },
        ],
      },
      'CE': {
        3: [
          { code: 'CE-301', name: 'Structural Analysis', credits: 4 },
          { code: 'CE-302', name: 'Geotechnical Engineering', credits: 4 },
          { code: 'CE-303', name: 'Transportation Engineering', credits: 3 },
          { code: 'MTH-301', name: 'Probability and Statistics', credits: 3 },
          { code: 'CE-304', name: 'Environmental Engineering', credits: 3 },
          { code: 'CE-305', name: 'Structural Lab', credits: 1 },
          { code: 'CE-306', name: 'Geo Lab', credits: 1 },
        ],
        4: [
          { code: 'CE-401', name: 'Concrete Technology', credits: 4 },
          { code: 'CE-402', name: 'Hydrology', credits: 4 },
          { code: 'CE-403', name: 'Foundation Engineering', credits: 3 },
          { code: 'CE-404', name: 'Construction Management', credits: 3 },
          { code: 'MGT-401', name: 'Organizational Behaviour', credits: 2 },
          { code: 'CE-405', name: 'Concrete Lab', credits: 1 },
          { code: 'CE-406', name: 'Hydro Lab', credits: 1 },
        ],
      },
      'MATH': {
        3: [
          { code: 'MTH-301', name: 'Real Analysis', credits: 4 },
          { code: 'MTH-302', name: 'Abstract Algebra', credits: 4 },
          { code: 'MTH-303', name: 'Differential Equations', credits: 3 },
          { code: 'MTH-304', name: 'Complex Analysis', credits: 3 },
          { code: 'MTH-305', name: 'Numerical Methods', credits: 3 },
          { code: 'MTH-306', name: 'Math Lab', credits: 1 },
        ],
        4: [
          { code: 'MTH-401', name: 'Topology', credits: 4 },
          { code: 'MTH-402', name: 'Functional Analysis', credits: 4 },
          { code: 'MTH-403', name: 'Number Theory', credits: 3 },
          { code: 'MTH-404', name: 'Optimization Theory', credits: 3 },
          { code: 'MGT-401', name: 'Organizational Behaviour', credits: 2 },
          { code: 'MTH-405', name: 'Computing Lab', credits: 1 },
        ],
      },
    };

    // Default subjects for unknown branches
    const defaultSubjects = subjectTemplates['CSE'];

    const academicYear = '2024-25';
    let recordsCreated = 0;

    for (const student of students) {
      const branch = student.branch || 'CSE';
      // Determine student year and semester correctly
      let studentYear = student.year || 2;
      // If year is a calendar year (e.g. 2024), convert it to relative year (1-4)
      if (studentYear > 100) {
        studentYear = 2; // Default to Year 2 if current data looks like a calendar year
      }

      const currentSem = studentYear * 2;
      const previousSem = currentSem - 1;

      // Get subjects for this branch
      const branchSubjects = subjectTemplates[branch] || defaultSubjects;

      // Generate records for current and previous semester only (max 2 semesters)
      const semestersToGenerate = [previousSem, currentSem].filter(sem => sem > 0 && branchSubjects[sem]);

      // Track aggregate stats across all semesters for this student
      let latestCgpa = 0;
      const allAttendancePercentages: number[] = [];

      for (const semester of semestersToGenerate) {
        const subjects = branchSubjects[semester];
        if (!subjects) continue;

        // Generate semester record (SGPA/CGPA) with realistic distribution
        // ~15% students get poor grades (3.5-5.5), ~25% average (5.5-7.0), ~60% good (7.0-9.5)
        const roll = Math.random();
        let sgpa: number;
        if (roll < 0.15) {
          sgpa = parseFloat((3.5 + Math.random() * 2.0).toFixed(2)); // 3.5-5.5 (struggling)
        } else if (roll < 0.40) {
          sgpa = parseFloat((5.5 + Math.random() * 1.5).toFixed(2)); // 5.5-7.0 (average)
        } else {
          sgpa = parseFloat((7.0 + Math.random() * 2.5).toFixed(2)); // 7.0-9.5 (good)
        }
        sgpa = Math.min(sgpa, 10);

        const previousCGPA = semester === currentSem ? parseFloat((sgpa - 0.5 + Math.random()).toFixed(2)) : sgpa;
        const cgpa = semester === currentSem
          ? parseFloat(Math.min(((previousCGPA * (semester - 1) + sgpa) / semester), 10).toFixed(2))
          : sgpa;

        // Keep track of the latest (cumulative) CGPA
        latestCgpa = cgpa;

        await db.semesterRecord.upsert({
          where: {
            studentId_semester: {
              studentId: student.id,
              semester: semester
            }
          },
          create: {
            studentId: student.id,
            semester: semester,
            sgpa: sgpa,
            cgpa: cgpa,
            creditsEarned: subjects.reduce((sum, s) => sum + s.credits, 0),
            creditsTotal: subjects.reduce((sum, s) => sum + s.credits, 0),
            academicYear: academicYear,
          },
          update: {
            sgpa: sgpa,
            cgpa: cgpa,
            creditsEarned: subjects.reduce((sum, s) => sum + s.credits, 0),
            creditsTotal: subjects.reduce((sum, s) => sum + s.credits, 0),
          }
        });

        // Generate attendance for each subject
        for (const subject of subjects) {
          const totalClasses = 14 + Math.floor(Math.random() * 7); // 14-20 classes
          // ~20% students get poor attendance (35-60%), ~20% average (60-75%), ~60% good (75-95%)
          const attRoll = Math.random();
          let attRate: number;
          if (attRoll < 0.20) {
            attRate = 0.35 + Math.random() * 0.25; // 35-60%
          } else if (attRoll < 0.40) {
            attRate = 0.60 + Math.random() * 0.15; // 60-75%
          } else {
            attRate = 0.75 + Math.random() * 0.20; // 75-95%
          }
          const attended = Math.floor(totalClasses * attRate);
          const percentage = parseFloat(((attended / totalClasses) * 100).toFixed(1));
          allAttendancePercentages.push(percentage);

          await db.semesterAttendance.upsert({
            where: {
              studentId_semester_subjectCode: {
                studentId: student.id,
                semester: semester,
                subjectCode: subject.code,
              }
            },
            create: {
              studentId: student.id,
              semester: semester,
              subjectCode: subject.code,
              subjectName: subject.name,
              totalClasses: totalClasses,
              attended: attended,
              percentage: percentage,
              academicYear: academicYear,
            },
            update: {
              subjectName: subject.name,
              totalClasses: totalClasses,
              attended: attended,
              percentage: percentage,
            }
          });

          // Generate subject marks
          const internalMarks = parseFloat((15 + Math.random() * 15).toFixed(1)); // 15-30 out of 30
          const externalMarks = parseFloat((25 + Math.random() * 45).toFixed(1)); // 25-70 out of 70
          const totalMarks = parseFloat((internalMarks + externalMarks).toFixed(1));

          let grade = 'F';
          let gradePoints = 0;
          if (totalMarks >= 90) { grade = 'O'; gradePoints = 10; }
          else if (totalMarks >= 80) { grade = 'A+'; gradePoints = 9; }
          else if (totalMarks >= 70) { grade = 'A'; gradePoints = 8; }
          else if (totalMarks >= 60) { grade = 'B+'; gradePoints = 7; }
          else if (totalMarks >= 50) { grade = 'B'; gradePoints = 6; }
          else if (totalMarks >= 40) { grade = 'C'; gradePoints = 5; }
          else { grade = 'F'; gradePoints = 0; }

          await db.subjectMark.upsert({
            where: {
              studentId_semester_subjectCode: {
                studentId: student.id,
                semester: semester,
                subjectCode: subject.code,
              }
            },
            create: {
              studentId: student.id,
              semester: semester,
              subjectCode: subject.code,
              subjectName: subject.name,
              credits: subject.credits,
              internalMarks,
              externalMarks,
              totalMarks,
              grade,
              gradePoints,
              academicYear: academicYear,
            },
            update: {
              subjectName: subject.name,
              credits: subject.credits,
              internalMarks,
              externalMarks,
              totalMarks,
              grade,
              gradePoints,
            }
          });

          recordsCreated++;
        }
      } // END of semester loop

      // === AGGREGATE CALCULATIONS (once per student, OUTSIDE semester loop) ===
      const overallAvgAttendance = allAttendancePercentages.length > 0
        ? allAttendancePercentages.reduce((sum, val) => sum + val, 0) / allAttendancePercentages.length
        : 0;

      // --- UNIFIED TIERED POINT SYSTEM (higher points = higher risk) ---
      // Attendance Risk Points (Max 50)
      let attPoints = 0;
      if (overallAvgAttendance >= 95) attPoints = 0;
      else if (overallAvgAttendance >= 90) attPoints = 5;
      else if (overallAvgAttendance >= 85) attPoints = 10;
      else if (overallAvgAttendance >= 80) attPoints = 15;
      else if (overallAvgAttendance >= 75) attPoints = 20;
      else if (overallAvgAttendance >= 70) attPoints = 30;
      else if (overallAvgAttendance >= 60) attPoints = 40;
      else attPoints = 50;

      // CGPA Risk Points (Max 50)
      let cgpaPoints = 0;
      if (latestCgpa >= 9.5) cgpaPoints = 0;
      else if (latestCgpa >= 9.0) cgpaPoints = 5;
      else if (latestCgpa >= 8.5) cgpaPoints = 10;
      else if (latestCgpa >= 8.0) cgpaPoints = 15;
      else if (latestCgpa >= 7.5) cgpaPoints = 20;
      else if (latestCgpa >= 7.0) cgpaPoints = 25;
      else if (latestCgpa >= 6.0) cgpaPoints = 35;
      else if (latestCgpa >= 5.0) cgpaPoints = 45;
      else cgpaPoints = 50;

      // Consistency Risk Points (Max 30)
      let consistencyPoints = 0;
      if (overallAvgAttendance < 75) consistencyPoints += 15;
      if (latestCgpa < 6.0) consistencyPoints += 15;

      const totalPts = attPoints + cgpaPoints + consistencyPoints; // Max 130, higher = more risky

      // Risk score is scaled to 100% based on 130 total points
      const riskScore = (totalPts / 130) * 100;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (totalPts >= 60) riskLevel = 'high';
      else if (totalPts >= 30) riskLevel = 'medium';

      const factors: string[] = [];
      if (overallAvgAttendance < 60) factors.push(`Critical Attendance: ${overallAvgAttendance.toFixed(1)}%`);
      else if (overallAvgAttendance < 75) factors.push(`Low Attendance: ${overallAvgAttendance.toFixed(1)}%`);
      if (latestCgpa < 5.0) factors.push(`Critical CGPA: ${latestCgpa.toFixed(2)}`);
      else if (latestCgpa < 7.0) factors.push(`Low CGPA: ${latestCgpa.toFixed(2)}`);

      await db.riskAssessment.upsert({
        where: { studentId: student.id },
        create: {
          studentId: student.id,
          riskScore,
          riskLevel,
          attPoints,
          cgpaPoints,
          consistencyPoints,
          totalPoints: totalPts,
          factors: factors.join(', '),
        },
        update: {
          riskScore,
          riskLevel,
          attPoints,
          cgpaPoints,
          consistencyPoints,
          totalPoints: totalPts,
          factors: factors.join(', '),
        }
      });

      // Save points to PointsLedger
      await db.pointsLedger.upsert({
        where: { id: `initial-points-${student.id}` },
        create: {
          id: `initial-points-${student.id}`,
          studentId: student.id,
          totalPoints: totalPts,
          socialPoints: attPoints,
          academicPoints: cgpaPoints,
          reason: 'Academic Data Synchronization',
          change: totalPts,
        },
        update: {
          totalPoints: totalPts,
          socialPoints: attPoints,
          academicPoints: cgpaPoints,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Seeded academic records for ${students.length} students`,
      stats: {
        studentsProcessed: students.length,
        recordsCreated: recordsCreated
      }
    });

  } catch (error) {
    console.error('Seed academic data error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed academic data'
    }, { status: 500 });
  }
}

// Get academic records for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const semester = searchParams.get('semester');

    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: 'Student ID is required'
      }, { status: 400 });
    }



    // Get all semester records (to show full history in trends)
    let semesterRecords = await db.semesterRecord.findMany({
      where: { studentId },
      orderBy: { semester: 'desc' },
      // take: 2, // Removed limit to show all history
    });

    // Get pre-seeded attendance records from semesterAttendance table
    let attendanceRecords = await db.semesterAttendance.findMany({
      where: { studentId },
      orderBy: [{ semester: 'desc' }, { subjectCode: 'asc' }],
    });

    // Also compute LIVE attendance from attendanceLog (faculty-marked daily attendance)
    // This ensures attendance marked via the faculty page shows up for students
    const dailyLogs = await db.attendanceLog.findMany({
      where: { studentId },
    });

    // Group daily logs by subject and compute stats
    const logsBySubject: Record<string, { total: number; attended: number }> = {};
    for (const log of dailyLogs) {
      const realSubject = log.subject;
      if (!logsBySubject[realSubject]) {
        logsBySubject[realSubject] = { total: 0, attended: 0 };
      }
      logsBySubject[realSubject].total++;
      if (log.status === 'present' || log.status === 'late') {
        logsBySubject[realSubject].attended++;
      }
    }

    // Get student info for semester
    const student = await db.user.findUnique({
      where: { id: studentId },
      select: { year: true }
    });
    const studentSemester = (student?.year ? student.year * 2 : 4);

    // Merge live log data into attendanceRecords
    // For subjects in attendanceLog that ALREADY exist in semesterAttendance, update the counts
    // For subjects in attendanceLog that DON'T exist in semesterAttendance, add new entries
    const matchedSubjects = new Set<string>();

    for (const rec of attendanceRecords) {
      // Check if we have daily logs for this subject (by code or name)
      const logKey = logsBySubject[rec.subjectCode] ? rec.subjectCode
        : logsBySubject[rec.subjectName] ? rec.subjectName
          : null;
      if (logKey) {
        const logStats = logsBySubject[logKey];
        // Merge: add daily log counts on top of the seeded data
        rec.totalClasses = rec.totalClasses + logStats.total;
        rec.attended = rec.attended + logStats.attended;
        rec.percentage = rec.totalClasses > 0
          ? parseFloat(((rec.attended / rec.totalClasses) * 100).toFixed(1))
          : 0;
        matchedSubjects.add(logKey);
      }
    }

    // Add subjects that only exist in attendanceLog (not in semesterAttendance)
    for (const [subject, stats] of Object.entries(logsBySubject)) {
      if (!matchedSubjects.has(subject)) {
        const percentage = stats.total > 0 ? parseFloat(((stats.attended / stats.total) * 100).toFixed(1)) : 0;
        attendanceRecords.push({
          id: `live-${subject}`,
          studentId,
          semester: studentSemester,
          subjectCode: subject,
          subjectName: subject,
          totalClasses: stats.total,
          attended: stats.attended,
          percentage,
          academicYear: '2024-25',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
      }
    }

    // Get subject marks
    let subjectMarks = await db.subjectMark.findMany({
      where: { studentId },
      orderBy: [{ semester: 'desc' }, { subjectCode: 'asc' }],
    });

    // Filter by semester if provided
    if (semester && semester !== 'all') {
      const semNum = parseInt(semester);
      attendanceRecords = attendanceRecords.filter(r => r.semester === semNum);
      subjectMarks = subjectMarks.filter(r => r.semester === semNum);
      semesterRecords = semesterRecords.filter(r => r.semester === semNum);
    }

    // Calculate overall stats
    const latestRecord = semesterRecords[0];
    const currentCGPA = latestRecord?.cgpa || 0;
    const currentSGPA = latestRecord?.sgpa || 0;

    // Calculate overall attendance from the merged records
    const totalClasses = attendanceRecords.reduce((sum, r) => sum + r.totalClasses, 0);
    const totalAttended = attendanceRecords.reduce((sum, r) => sum + r.attended, 0);
    const overallAttendance = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(1)) : 0;

    // Calculate risk points using reversed tiered brackets (higher = more risky)
    // Attendance Risk Points (Max 50)
    let academicPoints = 0;
    if (overallAttendance >= 95) academicPoints = 0;
    else if (overallAttendance >= 90) academicPoints = 5;
    else if (overallAttendance >= 85) academicPoints = 10;
    else if (overallAttendance >= 80) academicPoints = 15;
    else if (overallAttendance >= 75) academicPoints = 20;
    else if (overallAttendance >= 70) academicPoints = 30;
    else if (overallAttendance >= 60) academicPoints = 40;
    else academicPoints = 50;

    // CGPA Risk Points (Max 50)
    let socialPoints = 0;
    if (currentCGPA >= 9.5) socialPoints = 0;
    else if (currentCGPA >= 9.0) socialPoints = 5;
    else if (currentCGPA >= 8.5) socialPoints = 10;
    else if (currentCGPA >= 8.0) socialPoints = 15;
    else if (currentCGPA >= 7.5) socialPoints = 20;
    else if (currentCGPA >= 7.0) socialPoints = 25;
    else if (currentCGPA >= 6.0) socialPoints = 35;
    else if (currentCGPA >= 5.0) socialPoints = 45;
    else socialPoints = 50;

    const totalPoints = academicPoints + socialPoints;

    return NextResponse.json({
      success: true,
      data: {
        semesterRecords,
        attendanceRecords,
        attendanceLogs: dailyLogs,
        subjectMarks,
        points: {
          totalPoints,
          academicPoints,
          socialPoints,
        },
        stats: {
          currentCGPA,
          currentSGPA,
          overallAttendance,
          totalCredits: semesterRecords.reduce((sum, r) => sum + r.creditsEarned, 0),
        }
      }
    });

  } catch (error) {
    console.error('Get academic data error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch academic data'
    }, { status: 500 });
  }
}
