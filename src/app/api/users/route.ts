// FORCE REBUILD - Unified Point System Verified
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

    // If role is student or all, fetch risk assessments and merge
    let usersWithRisk = users;
    if (!role || role === 'student') {
      const attendance = await db.semesterAttendance.findMany({
        select: { studentId: true, percentage: true }
      });
      const records = await db.semesterRecord.findMany({
        select: { studentId: true, cgpa: true },
        orderBy: { semester: 'desc' }
      });
      // Fetch attendance logs for consecutive days calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentLogs = await db.attendanceLog.findMany({
        where: {
          date: { gte: thirtyDaysAgo },
          status: 'present'
        },
        select: { studentId: true, date: true },
        orderBy: { date: 'asc' }
      });

      usersWithRisk = users.map(user => {
        if (user.role !== 'student') return user;

        const userAttendance = attendance.filter(a => a.studentId === user.id);
        const avgAtt = userAttendance.length > 0
          ? userAttendance.reduce((sum, a) => sum + a.percentage, 0) / userAttendance.length
          : 0;

        const latestRecord = records.find(r => r.studentId === user.id);
        const cgpa = latestRecord?.cgpa || 0;

        const hasData = userAttendance.length > 0 || latestRecord !== undefined;

        // --- REVERSED TIERED POINT SYSTEM (higher points = higher risk) ---
        // Attendance Risk Points (Max 50)
        let attPoints = 0;
        if (avgAtt >= 95) attPoints = 0;
        else if (avgAtt >= 90) attPoints = 5;
        else if (avgAtt >= 85) attPoints = 10;
        else if (avgAtt >= 80) attPoints = 15;
        else if (avgAtt >= 75) attPoints = 20;
        else if (avgAtt >= 70) attPoints = 30;
        else if (avgAtt >= 60) attPoints = 40;
        else attPoints = 50;

        // CGPA Risk Points (Max 50)
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

        const totalPoints = attPoints + cgpaPoints; // Max 100, higher = more risky

        // Risk score IS the total points (higher = greater risk)
        let riskScore: number;
        let riskLevel: string;

        if (!hasData) {
          riskScore = 100;
          riskLevel = 'high';
        } else {
          riskScore = totalPoints;
          if (riskScore >= 60) riskLevel = 'high';
          else if (riskScore >= 30) riskLevel = 'medium';
          else riskLevel = 'low';
        }

        const factors: string[] = [];
        if (hasData) {
          if (avgAtt < 60) factors.push(`Critical attendance: ${avgAtt.toFixed(1)}%`);
          else if (avgAtt < 70) factors.push(`Low attendance: ${avgAtt.toFixed(1)}%`);
          else if (avgAtt < 75) factors.push(`Below avg attendance: ${avgAtt.toFixed(1)}%`);
          if (cgpa > 0 && cgpa < 5.0) factors.push(`Critical CGPA: ${cgpa.toFixed(2)}`);
          else if (cgpa > 0 && cgpa < 6.0) factors.push(`Low CGPA: ${cgpa.toFixed(2)}`);
          else if (cgpa > 0 && cgpa < 7.0) factors.push(`Below avg CGPA: ${cgpa.toFixed(2)}`);
        }

        // Upsert risk assessment in background
        db.riskAssessment.upsert({
          where: { studentId: user.id },
          update: { riskLevel, riskScore, factors: factors.join(', ') },
          create: { studentId: user.id, riskLevel, riskScore, factors: factors.join(', ') }
        }).catch(() => { });

        return {
          ...user,
          riskLevel,
          riskScore,
          attendance: parseFloat(avgAtt.toFixed(1)),
          cgpa,
          totalPoints,
          attPoints,
          cgpaPoints,
          factors: factors.join(', ')
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
