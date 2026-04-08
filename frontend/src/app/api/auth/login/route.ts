import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edutrack-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    const { collegeId, password } = await request.json();

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
          data: { password: hashedPassword },
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
      const isStudent = normalizedCollegeId.startsWith('CSE') || 
                        normalizedCollegeId.startsWith('ECE') || 
                        normalizedCollegeId.startsWith('ME') || 
                        normalizedCollegeId.startsWith('CE') || 
                        normalizedCollegeId.startsWith('IT');

      // Allow auto-registration with default password for any ID format
      if (password === 'password123') {
        let mockUser;
        if (isFaculty) {
          const facultyData: Record<string, { name: string; department: string }> = {
            'T001': { name: 'Dr. Rajesh Sharma', department: 'CSE' },
            'T002': { name: 'Prof. Ananya Das', department: 'CSE' },
            'T003': { name: 'Dr. Vikram Patel', department: 'ECE' },
            'T004': { name: 'Prof. Sneha Roy', department: 'ECE' },
            'T005': { name: 'Dr. Amit Verma', department: 'ME' },
          };
          const faculty = facultyData[collegeId] || { name: 'Faculty Member', department: 'CSE' };
          
          // Create faculty user
          const hashedPassword = await bcrypt.hash(password, 10);
          mockUser = await db.user.create({
            data: {
              collegeId,
              password: hashedPassword,
              name: faculty.name,
              role: 'faculty',
              department: faculty.department,
            },
          });
        } else {
          // Create student user - detect branch from ID or default to CSE
          let branch = 'CSE';
          if (isStudent) {
            branch = collegeId.substring(0, 3);
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          mockUser = await db.user.create({
            data: {
              collegeId,
              password: hashedPassword,
              name: `Student ${collegeId}`,
              role: 'student',
              branch,
              section: 'A',
              year: 1,
              parentEmail: `parent@${collegeId.toLowerCase()}.com`,
              parentPhone: '9876543210',
            },
          });
        }

        const token = jwt.sign(
          { id: mockUser.id, collegeId: mockUser.collegeId, role: mockUser.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return NextResponse.json({
          success: true,
          user: {
            id: mockUser.id,
            collegeId: mockUser.collegeId,
            name: mockUser.name,
            role: mockUser.role,
            branch: mockUser.branch,
            section: mockUser.section,
            year: mockUser.year,
            department: mockUser.department,
          },
          token,
        });
      }

      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Use default password: password123 for first login.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Allow password123 as a default/reset password for non-admin users
      if (password === 'password123' && user.role !== 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
        // Continue to token generation below
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }
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
