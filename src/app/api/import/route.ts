import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Parse CSV string into array of objects
function parseCSV(csvString: string) {
  // Normalize line endings
  const normalized = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  // Parse CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  };

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim());
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    if (values.length >= Math.max(1, headers.length - 2)) { // Allow some flexibility
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Map CSV columns to standardized names
function mapStudentColumns(row: Record<string, string>) {
  return {
    collegeId: row['collegeid'] || row['college_id'] || row['id'] || row['rollno'] || row['roll_no'] || '',
    name: row['name'] || row['studentname'] || row['student_name'] || row['fullname'] || row['full_name'] || '',
    email: row['email'] || row['emailid'] || row['email_id'] || '',
    phone: row['phone'] || row['mobile'] || row['phoneno'] || row['phone_no'] || row['mobile_no'] || '',
    branch: row['branch'] || row['department'] || row['dept'] || '',
    section: row['section'] || row['sec'] || 'A',
    year: parseInt(row['year'] || row['semester'] || row['sem'] || '1'),
    parentEmail: row['parentemail'] || row['parent_email'] || row['guardianemail'] || row['guardian_email'] || '',
    parentPhone: row['parentphone'] || row['parent_phone'] || row['guardianphone'] || row['guardian_phone'] || '',
    password: row['password'] || row['pwd'] || row['pass'] || '',
  };
}

function mapFacultyColumns(row: Record<string, string>) {
  return {
    collegeId: row['collegeid'] || row['college_id'] || row['id'] || row['facultyid'] || row['faculty_id'] || row['teacherid'] || '',
    name: row['name'] || row['facultyname'] || row['faculty_name'] || row['fullname'] || row['full_name'] || '',
    email: row['email'] || row['emailid'] || row['email_id'] || '',
    phone: row['phone'] || row['mobile'] || row['phoneno'] || row['phone_no'] || row['mobile_no'] || '',
    department: row['department'] || row['dept'] || row['branch'] || '',
    password: row['password'] || row['pwd'] || row['pass'] || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({
        success: false,
        message: 'Type and data are required'
      }, { status: 400 });
    }

    if (type !== 'students' && type !== 'faculty') {
      return NextResponse.json({
        success: false,
        message: 'Type must be "students" or "faculty"'
      }, { status: 400 });
    }

    // Parse CSV data
    let records;
    try {
      records = parseCSV(data);
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : 'Failed to parse CSV';
      return NextResponse.json({
        success: false,
        message: errorMessage
      }, { status: 400 });
    }

    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid records found in CSV'
      }, { status: 400 });
    }

    const results = {
      total: records.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    if (type === 'students') {
      for (const record of records) {
        try {
          const student = mapStudentColumns(record);
          
          if (!student.collegeId || !student.name) {
            results.failed++;
            results.errors.push(`Missing required fields (collegeId/name) for record: ${JSON.stringify(record)}`);
            continue;
          }

          if (!student.password) {
            results.failed++;
            results.errors.push(`Missing password for student: ${student.collegeId}`);
            continue;
          }

          // Hash the password from CSV
          const hashedPassword = await bcrypt.hash(student.password, 10);

          // Check if student already exists
          const existing = await db.user.findUnique({
            where: { collegeId: student.collegeId }
          });

          if (existing) {
            // Update existing student (including password)
            await db.user.update({
              where: { collegeId: student.collegeId },
              data: {
                name: student.name,
                password: hashedPassword,
                email: student.email || null,
                phone: student.phone || null,
                branch: student.branch || null,
                section: student.section || null,
                year: student.year || null,
                parentEmail: student.parentEmail || null,
                parentPhone: student.parentPhone || null,
              }
            });
          } else {
            // Create new student
            await db.user.create({
              data: {
                collegeId: student.collegeId,
                password: hashedPassword,
                name: student.name,
                role: 'student',
                email: student.email || null,
                phone: student.phone || null,
                branch: student.branch || null,
                section: student.section || null,
                year: student.year || null,
                parentEmail: student.parentEmail || null,
                parentPhone: student.parentPhone || null,
              }
            });
          }
          
          results.success++;
        } catch (error: unknown) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Error processing student: ${errorMessage}`);
        }
      }
    } else if (type === 'faculty') {
      for (const record of records) {
        try {
          const faculty = mapFacultyColumns(record);
          
          if (!faculty.collegeId || !faculty.name) {
            results.failed++;
            results.errors.push(`Missing required fields (collegeId/name) for record: ${JSON.stringify(record)}`);
            continue;
          }

          if (!faculty.password) {
            results.failed++;
            results.errors.push(`Missing password for faculty: ${faculty.collegeId}`);
            continue;
          }

          // Hash the password from CSV
          const hashedPassword = await bcrypt.hash(faculty.password, 10);

          // Check if faculty already exists
          const existing = await db.user.findUnique({
            where: { collegeId: faculty.collegeId }
          });

          if (existing) {
            // Update existing faculty (including password)
            await db.user.update({
              where: { collegeId: faculty.collegeId },
              data: {
                name: faculty.name,
                password: hashedPassword,
                email: faculty.email || null,
                phone: faculty.phone || null,
                department: faculty.department || null,
              }
            });
          } else {
            // Create new faculty
            await db.user.create({
              data: {
                collegeId: faculty.collegeId,
                password: hashedPassword,
                name: faculty.name,
                role: 'faculty',
                email: faculty.email || null,
                phone: faculty.phone || null,
                department: faculty.department || null,
              }
            });
          }
          
          results.success++;
        } catch (error: unknown) {
          results.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Error processing faculty: ${errorMessage}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.success} ${type}, ${results.failed} failed`,
      results
    });

  } catch (error: unknown) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to import data';
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}
