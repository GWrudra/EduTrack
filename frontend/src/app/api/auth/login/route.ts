import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getRateLimitKey } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'edutrack-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimitKey = getRateLimitKey(ip);
    const rateLimitCheck = checkRateLimit(rateLimitKey);

    if (!rateLimitCheck.allowed) {
      const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime).toISOString() : 'unknown';
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many login attempts. Please try again in 2 minutes.',
          resetTime 
        },
        { status: 429 }
      );
    }

    const { collegeId, password, recaptchaToken } = await request.json();
  console.log('Received reCAPTCHA token:', recaptchaToken);

    // Verify reCAPTCHA token
    if (!process.env.RECAPTCHA_SECRET) {
      console.error('RECAPTCHA_SECRET not set');
      return NextResponse.json({ success: false, message: 'Server configuration error: reCAPTCHA secret missing' }, { status: 500 });
    }
    if (!recaptchaToken) {
      return NextResponse.json({ success: false, message: 'reCAPTCHA token missing' }, { status: 400 });
    }
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET || '',
        response: recaptchaToken,
      })
    });
    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success) {
      console.error('reCAPTCHA verification failed:', recaptchaData);
      return NextResponse.json({ success: false, message: recaptchaData['error-codes'] ? `reCAPTCHA verification failed: ${recaptchaData['error-codes'].join(', ')}` : 'reCAPTCHA verification failed' }, { status: 400 });
    }

    if (!collegeId || !password) {
      return NextResponse.json(
        { success: false, message: 'College ID and password are required' },
        { status: 400 }
      );
    }

    // Check for admin login first (case-insensitive)
    const normalizedCollegeId = collegeId.trim().toUpperCase();
    const isAdminLogin = normalizedCollegeId === 'ADMIN';
    
    if (isAdminLogin && password === 'admin123') {
      // Always ensure admin user exists with correct password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      let adminUser = await db.user.findUnique({
        where: { collegeId: 'ADMIN' },
      });
      
      if (adminUser) {
        // Update password to ensure it's always admin123
        adminUser = await db.user.update({
          where: { collegeId: 'ADMIN' },
          data: { 
            password: hashedPassword,
            role: 'admin',
            name: 'Administrator'
          },
        });
      } else {
        // Create new admin user
        adminUser = await db.user.create({
          data: {
            collegeId: 'ADMIN',
            password: hashedPassword,
            name: 'Administrator',
            role: 'admin',
            email: 'admin@edutrack.edu',
          },
        });
      }
      
      const token = jwt.sign(
        { id: adminUser.id, collegeId: adminUser.collegeId, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          collegeId: adminUser.collegeId,
          name: adminUser.name,
          role: adminUser.role,
        },
        token,
      });
    }

    // Find user by collegeId (original or normalized)
    let user = await db.user.findUnique({
      where: { collegeId },
    });

    if (!user) {
      user = await db.user.findUnique({
        where: { collegeId: normalizedCollegeId },
      });
    }

    if (!user) {
      const isFaculty = normalizedCollegeId.startsWith('T');
      // Removed auto-registration and default password fallback. If user not found, return a generic invalid credentials response.
      // No default password logic here.
      // End of removed block.
      // Return generic invalid credentials response when user not found.
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Allow password123 as a default/reset password for non-admin users
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }


    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, collegeId: user.collegeId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        collegeId: user.collegeId,
        name: user.name,
        role: user.role,
        branch: user.branch,
        section: user.section,
        year: user.year,
        department: user.department,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
