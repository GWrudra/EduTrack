// FORCE REBUILD - Unified Point System Verified
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';

// GET: Fetch all users with optional role filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const branch = searchParams.get('branch');
    const department = searchParams.get('department');

    // Build where clause
    const where: any = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { collegeId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (branch) {
      where.branch = branch;
    }

    if (department) {
      where.department = department;
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        collegeId: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        branch: true,
        section: true,
        year: true,
        department: true,
        parentEmail: true,
        parentPhone: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { collegeId: 'asc' }
      ]
    });

    // Read cached risk assessments from DB (calculated during academic data seeding)
    let usersWithRisk = users;
    if (!role || role === 'all' || role === 'student') {
      const riskAssessments = await db.riskAssessment.findMany({
        select: {
          studentId: true,
          riskLevel: true,
          riskScore: true,
          factors: true,
        }
      });

      const riskMap = new Map(riskAssessments.map(r => [r.studentId, r]));

      // Fetch the latest CGPA to display in Risk Analysis and Export outputs
      const semesterRecords = await db.semesterRecord.findMany({
        orderBy: { semester: 'desc' },
        select: { studentId: true, cgpa: true }
      });
      const cgpaMap = new Map();
      for (const rec of semesterRecords) {
        if (!cgpaMap.has(rec.studentId)) {
          cgpaMap.set(rec.studentId, rec.cgpa);
        }
      }

      // Fetch LIVE attendance logs to merge with aggregated stats for real-time risk
      const allLogs = await db.attendanceLog.findMany({
        select: { studentId: true, status: true }
      });
      
      const logsMap = new Map();
      for (const log of allLogs) {
        if (!logsMap.has(log.studentId)) logsMap.set(log.studentId, { attended: 0, total: 0 });
        const stats = logsMap.get(log.studentId);
        stats.total++;
        if (log.status === 'present' || log.status === 'late') stats.attended++;
      }

      // Fetch aggregated attendance percentages
      const semesterAttendance = await db.semesterAttendance.findMany({
        select: { studentId: true, percentage: true }
      });
      
      const attMap = new Map();
      for (const att of semesterAttendance) {
        if (!attMap.has(att.studentId)) attMap.set(att.studentId, []);
        attMap.get(att.studentId).push(att.percentage);
      }

      usersWithRisk = users.map(user => {
        if (user.role !== 'student') return user;

        const cached = riskMap.get(user.id);
        const cgpa = cgpaMap.get(user.id) || 0;
        
        // Calculate Live Attendance
        const liveLogs = logsMap.get(user.id) || { attended: 0, total: 0 };
        const liveLogAvg = liveLogs.total > 0 ? (liveLogs.attended / liveLogs.total * 100) : 0;
        
        const studentAtts = attMap.get(user.id) || [];
        // Combined average: prioritize live logs if they have more data, or average them out
        const avgAtt = liveLogAvg > 0 ? liveLogAvg : (studentAtts.length > 0 
          ? studentAtts.reduce((a: number, b: number) => a + b, 0) / studentAtts.length 
          : 0);
        
        let attPoints = 0;
        if (avgAtt >= 95) attPoints = 0;
        else if (avgAtt >= 90) attPoints = 5;
        else if (avgAtt >= 85) attPoints = 10;
        else if (avgAtt >= 80) attPoints = 15;
        else if (avgAtt >= 75) attPoints = 20;
        else if (avgAtt >= 70) attPoints = 30;
        else if (avgAtt >= 60) attPoints = 40;
        else attPoints = 50;

        // Calculate CGPA Points (Max 50)
        let cgpaPoints = 0;
        if (cgpa >= 9.5) cgpaPoints = 0;
        else if (cgpa >= 9.0) cgpaPoints = 5;
        else if (cgpa >= 8.5) cgpaPoints = 10;
        else if (cgpa >= 8.0) cgpaPoints = 15;
        else if (cgpa >= 7.5) cgpaPoints = 20;
        else if (cgpa >= 7.0) cgpaPoints = 25;
        else if (cgpa >= 6.0) cgpaPoints = 35;
        else if (cgpa >= 5.0) cgpaPoints = 45;
        else cgpaPoints = 50;

        // Calculate Consistency Points (Max 30)
        // Rule: Lose 15 points if avgAtt < 75%, Lose 15 points if cgpa < 6.0
        let consistencyPoints = 0;
        if (avgAtt < 75) consistencyPoints += 15;
        if (cgpa < 6.0) consistencyPoints += 15;

        const totalPoints = attPoints + cgpaPoints + consistencyPoints;
        // Calculate consistency score scaled to 100%
        const liveRiskScore = (totalPoints / 130) * 100;
        const liveRiskLevel = totalPoints >= 60 ? 'high' : totalPoints >= 30 ? 'medium' : 'low';

        // Generate detailed risk factors on the fly
        const liveFactors: string[] = [];
        if (avgAtt < 60) liveFactors.push(`Critical Attendance: ${avgAtt.toFixed(1)}%`);
        else if (avgAtt < 75) liveFactors.push(`Low Attendance: ${avgAtt.toFixed(1)}%`);
        if (cgpa < 5.0) liveFactors.push(`Critical CGPA: ${cgpa.toFixed(2)}`);
        else if (cgpa < 7.0) liveFactors.push(`Low CGPA: ${cgpa.toFixed(2)}`);

        return {
          ...user,
          riskLevel: liveRiskLevel, // Prioritize live calculation
          riskScore: liveRiskScore, // Prioritize live calculation
          factors: liveFactors.length > 0 ? liveFactors.join(', ') : (cached?.factors || 'Healthy academic record'), 
          cgpa: cgpa,
          attendance: avgAtt,
          attPoints,
          cgpaPoints,
          consistencyPoints,
          totalPoints,
        };
      });
    }


    // Get stats
    const totalUsers = await db.user.count();
    const studentCount = await db.user.count({ where: { role: 'student' } });
    const facultyCount = await db.user.count({ where: { role: 'faculty' } });
    const adminCount = await db.user.count({ where: { role: 'admin' } });

    return NextResponse.json({
      success: true,
      users: usersWithRisk,
      stats: {
        total: totalUsers,
        students: studentCount,
        faculty: facultyCount,
        admins: adminCount
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users'
    }, { status: 500 });
  }
}

// PATCH: Update user profile or reset password
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password, name, email, phone, branch, section, year, department, parentEmail, parentPhone } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const data: any = {};
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (branch !== undefined) data.branch = branch;
    if (section !== undefined) data.section = section;
    if (year !== undefined) data.year = year;
    if (department !== undefined) data.department = department;
    if (parentEmail !== undefined) data.parentEmail = parentEmail;
    if (parentPhone !== undefined) data.parentPhone = parentPhone;

    await db.user.update({
      where: { id },
      data
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update user'
    }, { status: 500 });
  }
}

// DELETE: Delete a user by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('userId'); // Matches the frontend call

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Don't allow deleting admin users
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete admin users'
      }, { status: 403 });
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete user'
    }, { status: 500 });
  }
}
