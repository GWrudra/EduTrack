import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, password } = body;

    if (!role || !password) {
      return NextResponse.json({
        success: false,
        message: 'Role and password are required'
      }, { status: 400 });
    }

    if (role !== 'students' && role !== 'faculty' && role !== 'all') {
      return NextResponse.json({
        success: false,
        message: 'Role must be "students", "faculty", or "all"'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters'
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let count = 0;

    if (role === 'students' || role === 'all') {
      const result = await db.user.updateMany({
        where: { role: 'student' },
        data: { password: hashedPassword }
      });
      count += result.count;
    }

    if (role === 'faculty' || role === 'all') {
      const result = await db.user.updateMany({
        where: { role: 'faculty' },
        data: { password: hashedPassword }
      });
      count += result.count;
    }

    return NextResponse.json({
      success: true,
      message: `Password reset for ${count} users`,
      count
    });

  } catch (error) {
    console.error('Reset passwords error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset passwords'
    }, { status: 500 });
  }
}
