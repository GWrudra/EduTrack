import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { collegeId, email } = await request.json();

    if (!collegeId || !email) {
      return NextResponse.json(
        { success: false, message: 'College ID and email are required' },
        { status: 400 }
      );
    }

    // Find user by collegeId and email
    const user = await db.user.findFirst({
      where: { 
        collegeId,
        OR: [
          { email },
          { parentEmail: email },
        ]
      },
    });

    if (!user) {
      // For demo, return success even if user not found
      return NextResponse.json({
        success: true,
        message: 'If an account exists with these credentials, a reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // In production, save token to database and send email
    // For demo, we just return success

    return NextResponse.json({
      success: true,
      message: 'Reset link sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
