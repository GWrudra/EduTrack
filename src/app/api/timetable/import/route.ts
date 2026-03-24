import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as xlsx from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse the Excel file from buffer natively in Javascript
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    const semester = formData.get('semester') ? parseInt(formData.get('semester') as string) : null;
    const mode = formData.get('mode') || 'append'; // 'append' or 'replace'

    // Time slots mapping (column index -> start_time, end_time)
    const timeSlots: Record<number, [string, string]> = {
      2: ['07:30', '08:30'],
      3: ['08:40', '09:40'],
      4: ['09:50', '10:50'],
      5: ['11:00', '12:00'],
      // 6 is LUNCH (skipped)
      7: ['13:00', '14:00'],
      8: ['14:00', '15:00'],
    };
    
    // Day name to day number mapping
    const dayMap: Record<string, number> = {
      'MONDAY': 1,
      'TUESDAY': 2,
      'WEDNESDAY': 3,
      'THURSDAY': 4,
      'FRIDAY': 5,
      'SATURDAY': 6,
      'SUNDAY': 0,
    };
    
    const entries: any[] = [];
    let currentDay: string | null = null;
    let currentDayNum: number | null = null;

    // Start from row index 4 (5th row) to match original python script's logic
    for (let i = 4; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row || row.length === 0) continue;

        const dayVal = row[0] ? String(row[0]).trim().toUpperCase() : null;
        if (dayVal && dayMap[dayVal] !== undefined) {
            currentDay = dayVal;
            currentDayNum = dayMap[dayVal];
        }

        const sectionField = row[1] ? String(row[1]).trim() : null;
        if (!sectionField || sectionField.toLowerCase() === 'nan' || sectionField === '') {
            continue;
        }

        // Process each time slot column
        for (const [colIdxStr, [startTime, endTime]] of Object.entries(timeSlots)) {
            const colIdx = parseInt(colIdxStr);
            if (colIdx >= row.length) continue;

            const subjectField = row[colIdx] ? String(row[colIdx]).trim() : null;

            if (!subjectField || subjectField.toLowerCase() === 'nan' || subjectField === '' || subjectField.toUpperCase().includes('LUNCH') || subjectField.toUpperCase().includes('BREAK')) {
                continue;
            }

            if (currentDayNum !== null && currentDay !== null) {
                entries.push({
                    dayOfWeek: currentDayNum,
                    dayName: currentDay,
                    section: sectionField.toUpperCase(),
                    startTime: startTime,
                    endTime: endTime,
                    subject: subjectField.toUpperCase(),
                    semester: semester
                });
            }
        }
    }

    // Clear existing timetable entries
    // Handle deletion if in replace mode
    if (mode === 'replace') {
      if (semester) {
        await db.timetableEntry.deleteMany({
          where: { semester: semester }
        });
      } else {
        await db.timetableEntry.deleteMany(); // Clear all if no semester specified
      }
    }

    // Insert new parsed entries into the database
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        await db.timetableEntry.create({
          data: {
            dayOfWeek: entry.dayOfWeek,
            dayName: entry.dayName,
            section: entry.section,
            startTime: entry.startTime,
            endTime: entry.endTime,
            subject: entry.subject,
            semester: entry.semester
          }
        });
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Failed to add ${entry.section} - ${entry.subject}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${successCount} timetable entries natively`,
      results: {
        total: entries.length,
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10)
      }
    });

  } catch (error: any) {
    console.error('Import excel native error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to import timetable'
    }, { status: 500 });
  }
}
