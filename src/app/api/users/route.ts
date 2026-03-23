import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

        // --- ATTENDANCE POINTS (max 50) ---
        const userAttendance = attendance.filter(a => a.studentId === user.id);
        const avgAtt = userAttendance.length > 0
          ? userAttendance.reduce((sum, a) => sum + a.percentage, 0) / userAttendance.length
          : 0;

        let attPoints = 0;
        if (avgAtt >= 95) attPoints = 50;
        else if (avgAtt >= 90) attPoints = 45;
        else if (avgAtt >= 85) attPoints = 40;
        else if (avgAtt >= 80) attPoints = 35;
        else if (avgAtt >= 75) attPoints = 30;
        else if (avgAtt >= 70) attPoints = 20;
        else if (avgAtt >= 60) attPoints = 10;
        else attPoints = 0;

        // --- CGPA POINTS (max 50) ---
        const latestRecord = records.find(r => r.studentId === user.id);
        const cgpa = latestRecord?.cgpa || 0;

        let cgpaPoints = 0;
        if (cgpa >= 9.5) cgpaPoints = 50;
        else if (cgpa >= 9.0) cgpaPoints = 45;
        else if (cgpa >= 8.5) cgpaPoints = 40;
        else if (cgpa >= 8.0) cgpaPoints = 35;
        else if (cgpa >= 7.5) cgpaPoints = 30;
        else if (cgpa >= 7.0) cgpaPoints = 25;
        else if (cgpa >= 6.0) cgpaPoints = 15;
        else if (cgpa >= 5.0) cgpaPoints = 5;
        else cgpaPoints = 0;

        // --- CONSISTENCY POINTS (max 30) ---
        // Count consecutive present days
        const studentLogs = recentLogs
          .filter(l => l.studentId === user.id)
          .map(l => new Date(l.date).toDateString());
        const uniqueDays = [...new Set(studentLogs)];

        let maxConsecutive = 0;
        let currentStreak = 0;
        for (let i = 0; i < uniqueDays.length; i++) {
          if (i === 0) {
            currentStreak = 1;
          } else {
            const prev = new Date(uniqueDays[i - 1]);
            const curr = new Date(uniqueDays[i]);
            const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
          }
          if (currentStreak > maxConsecutive) maxConsecutive = currentStreak;
        }

        let consistencyPoints = 0;
        if (maxConsecutive >= 30) consistencyPoints = 30;
        else if (maxConsecutive >= 20) consistencyPoints = 25;
        else if (maxConsecutive >= 15) consistencyPoints = 20;
        else if (maxConsecutive >= 10) consistencyPoints = 15;
        else if (maxConsecutive >= 5) consistencyPoints = 10;
        else if (maxConsecutive >= 3) consistencyPoints = 5;
        else consistencyPoints = 0;

        // --- TOTAL SCORE & RISK LEVEL ---
        // Max = 130 points; normalize to 0-100 scale
        const totalPoints = attPoints + cgpaPoints + consistencyPoints;

        // No-data fallback: if student has no attendance AND no academic records, can't assess → default low
        const hasData = userAttendance.length > 0 || latestRecord !== undefined;

        let riskScore: number;
        let riskLevel: string;

        if (!hasData) {
          // Student has no records yet — treat as low risk (unassessed)
          riskScore = 70; // appears healthy on screen
          riskLevel = 'low';
        } else {
          riskScore = parseFloat(((totalPoints / 130) * 100).toFixed(1));
          // Balanced thresholds:
          // < 30%  → High   (serious issues in multiple factors)
          // 30-54% → Medium (some concern in one or two areas)
          // 55%+   → Low    (performing adequately)
          if (riskScore < 30) riskLevel = 'high';
          else if (riskScore < 55) riskLevel = 'medium';
          else riskLevel = 'low';
        }

        const factors: string[] = [];
        if (hasData) {
          if (avgAtt < 75) factors.push(`Low attendance: ${avgAtt.toFixed(1)}%`);
          if (cgpa > 0 && cgpa < 6.0) factors.push(`Low CGPA: ${cgpa.toFixed(2)}`);
          if (maxConsecutive < 5 && userAttendance.length > 0) factors.push(`Low consistency: ${maxConsecutive} days`);
        }

        // Upsert risk assessment in background (fire-and-forget)
        db.riskAssessment.upsert({
          where: { studentId: user.id },
          update: { riskLevel, riskScore, factors: factors.join(', ') },
          create: { studentId: user.id, riskLevel, riskScore, factors: factors.join(', ') }
        }).catch(() => {});


        return {
          ...user,
          riskLevel,
          riskScore,
          attendance: parseFloat(avgAtt.toFixed(1)),
          cgpa,
          totalPoints,
          attPoints,
          cgpaPoints,
          consistencyPoints,
          maxConsecutiveDays: maxConsecutive,
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

// DELETE: Delete a user by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
