import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

interface StudentCSV {
  collegeId: string;
  name: string;
  branch: string;
  section: string;
  year: string;
  parentEmail: string;
  parentPhone: string;
}

interface FacultyCSV {
  teacherId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
}

async function parseCSV(filePath: string): Promise<string[][]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

async function seedStudents() {
  console.log('Seeding students...');
  const csvPath = path.join(process.cwd(), 'upload', 'Student-details.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('Student CSV not found, skipping...');
    return;
  }

  const rows = await parseCSV(csvPath);
  const headers = rows[0];
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const student: StudentCSV = {
      collegeId: row[0],
      name: row[1],
      branch: row[2],
      section: row[3],
      year: row[4],
      parentEmail: row[5],
      parentPhone: row[6],
    };

    try {
      await db.user.upsert({
        where: { collegeId: student.collegeId },
        update: {
          name: student.name,
          branch: student.branch,
          section: student.section,
          year: parseInt(student.year),
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
        },
        create: {
          collegeId: student.collegeId,
          name: student.name,
          role: 'student',
          password: hashedPassword,
          branch: student.branch,
          section: student.section,
          year: parseInt(student.year),
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
        },
      });
      console.log(`Created/Updated student: ${student.collegeId}`);
    } catch (error) {
      console.error(`Error creating student ${student.collegeId}:`, error);
    }
  }

  console.log(`Seeded ${rows.length - 1} students`);
}

async function seedFaculty() {
  console.log('Seeding faculty...');
  const csvPath = path.join(process.cwd(), 'upload', 'Faculty-details.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('Faculty CSV not found, skipping...');
    return;
  }

  const rows = await parseCSV(csvPath);
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const faculty: FacultyCSV = {
      teacherId: row[0],
      name: row[1],
      department: row[2],
      email: row[3],
      phone: row[4],
    };

    try {
      await db.user.upsert({
        where: { collegeId: faculty.teacherId },
        update: {
          name: faculty.name,
          department: faculty.department,
          email: faculty.email,
          phone: faculty.phone,
        },
        create: {
          collegeId: faculty.teacherId,
          name: faculty.name,
          role: 'faculty',
          password: hashedPassword,
          department: faculty.department,
          email: faculty.email,
          phone: faculty.phone,
        },
      });
      console.log(`Created/Updated faculty: ${faculty.teacherId}`);
    } catch (error) {
      console.error(`Error creating faculty ${faculty.teacherId}:`, error);
    }
  }

  console.log(`Seeded ${rows.length - 1} faculty members`);
}

async function seedCourses() {
  console.log('Seeding courses...');
  
  const courses = [
    { code: 'CS201', name: 'Data Structures', credits: 4, instructor: 'Dr. Rajesh Sharma', department: 'CSE' },
    { code: 'CS301', name: 'Database Systems', credits: 3, instructor: 'Prof. Ananya Das', department: 'CSE' },
    { code: 'CS401', name: 'Operating Systems', credits: 4, instructor: 'Dr. Vikram Patel', department: 'CSE' },
    { code: 'CS501', name: 'Computer Networks', credits: 3, instructor: 'Prof. Sneha Roy', department: 'CSE' },
    { code: 'CS601', name: 'Machine Learning', credits: 4, instructor: 'Dr. Amit Verma', department: 'CSE' },
    { code: 'EC201', name: 'Signals and Systems', credits: 4, instructor: 'Dr. Vikram Patel', department: 'ECE' },
    { code: 'EC301', name: 'Digital Communications', credits: 3, instructor: 'Prof. Sneha Roy', department: 'ECE' },
    { code: 'ME201', name: 'Thermodynamics', credits: 4, instructor: 'Dr. Amit Verma', department: 'ME' },
    { code: 'CE201', name: 'Structural Analysis', credits: 4, instructor: 'Dr. Rahul Nair', department: 'CE' },
    { code: 'IT201', name: 'Web Technologies', credits: 3, instructor: 'Dr. Arjun Kumar', department: 'IT' },
  ];

  for (const course of courses) {
    try {
      await db.course.upsert({
        where: { code: course.code },
        update: course,
        create: course,
      });
      console.log(`Created/Updated course: ${course.code}`);
    } catch (error) {
      console.error(`Error creating course ${course.code}:`, error);
    }
  }

  console.log(`Seeded ${courses.length} courses`);
}

async function seedAttendanceAndPoints() {
  console.log('Seeding attendance and points...');
  
  const students = await db.user.findMany({
    where: { role: 'student' },
  });

  const subjects = ['DS', 'DBMS', 'OS', 'CN', 'ML', 'SS', 'DC', 'TD', 'SA', 'WT'];
  const statuses = ['present', 'present', 'present', 'present', 'absent', 'late']; // 75% attendance rate

  for (const student of students) {
    // Create attendance records
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      await db.attendanceLog.create({
        data: {
          studentId: student.id,
          subject: subjects[i % subjects.length],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date,
        },
      });
    }

    // Create points ledger
    const attendance = Math.floor(Math.random() * 30) + 60; // 60-90%
    const cgpa = parseFloat((Math.random() * 3 + 5).toFixed(2)); // 5.0-8.0
    
    await db.pointsLedger.create({
      data: {
        studentId: student.id,
        totalPoints: Math.floor(Math.random() * 50) + 50,
        socialPoints: Math.floor(Math.random() * 30),
        academicPoints: Math.floor(Math.random() * 50),
      },
    });

    // Create risk assessment
    const riskScore = (100 - attendance) * 0.5 + (8 - cgpa) * 10;
    await db.riskAssessment.create({
      data: {
        studentId: student.id,
        riskScore,
        riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
        factors: JSON.stringify({ attendance, cgpa }),
      },
    });
  }

  console.log(`Seeded attendance and points for ${students.length} students`);
}

async function main() {
  console.log('Starting seed...');
  
  await seedStudents();
  await seedFaculty();
  await seedCourses();
  await seedAttendanceAndPoints();
  
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
