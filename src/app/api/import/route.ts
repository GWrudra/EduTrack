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
    const { type, data, mode = 'append' } = body;

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

    if (mode === 'replace') {
      await db.user.deleteMany({
        where: { role: type === 'students' ? 'student' : 'faculty' }
      });
    }

    // Parse CSV data
    let records;
    try {
      records = parseCSV(data);
    } catch (parseError: any) {
      return NextResponse.json({
        success: false,
        message: parseError.message || 'Failed to parse CSV'
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
            results.errors.push(`Missing fields (collegeId/name) for record: ${JSON.stringify(record)}`);
            continue;
          }

          const hashedPassword = await bcrypt.hash(student.password || '123456', 10);

          await db.user.upsert({
            where: { collegeId: student.collegeId },
            update: {
              name: student.name,
              email: student.email || null,
              phone: student.phone || null,
              branch: student.branch || null,
              section: student.section || null,
              year: student.year || null,
              parentEmail: student.parentEmail || null,
              parentPhone: student.parentPhone || null,
            },
            create: {
              collegeId: student.collegeId,
              name: student.name,
              password: hashedPassword,
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

          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Error processing student: ${error.message}`);
        }
      }
    } else if (type === 'faculty') {
      for (const record of records) {
        try {
          const faculty = mapFacultyColumns(record);

          if (!faculty.collegeId || !faculty.name) {
            results.failed++;
            results.errors.push(`Missing fields (collegeId/name) for record: ${JSON.stringify(record)}`);
            continue;
          }

          const hashedPassword = await bcrypt.hash(faculty.password || '123456', 10);

          await db.user.upsert({
            where: { collegeId: faculty.collegeId },
            update: {
              name: faculty.name,
              email: faculty.email || null,
              phone: faculty.phone || null,
              department: faculty.department || null,
            },
            create: {
              collegeId: faculty.collegeId,
              name: faculty.name,
              password: hashedPassword,
              role: 'faculty',
              email: faculty.email || null,
              phone: faculty.phone || null,
              department: faculty.department || null,
            }
          });

          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Error processing faculty: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.success} ${type}, ${results.failed} failed`,
      results
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to import data'
    }, { status: 500 });
  }
}
