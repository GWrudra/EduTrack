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
      const riskAssessments = await db.riskAssessment.findMany();
      const attendance = await db.semesterAttendance.findMany({
        select: { studentId: true, percentage: true }
      });
      const records = await db.semesterRecord.findMany({
        select: { studentId: true, cgpa: true },
        orderBy: { semester: 'desc' }
      });

      usersWithRisk = users.map(user => {
        if (user.role !== 'student') return user;

        const risk = riskAssessments.find(r => r.studentId === user.id);
        const userAttendance = attendance.filter(a => a.studentId === user.id);
        const avgAtt = userAttendance.length > 0
          ? userAttendance.reduce((sum, a) => sum + a.percentage, 0) / userAttendance.length
          : 0;
        const latestRecord = records.find(r => r.studentId === user.id);

        return {
          ...user,
          riskLevel: risk?.riskLevel || 'low',
          riskScore: risk?.riskScore || 0,
          attendance: parseFloat(avgAtt.toFixed(1)),
          cgpa: latestRecord?.cgpa || 0,
          factors: risk?.factors || ''
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
