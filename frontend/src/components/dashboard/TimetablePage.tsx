'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, Calendar, BookOpen } from 'lucide-react';
import { getBatchFromId, getOrdinal } from '@/lib/utils';

export function TimetablePage() {
  const { user, dataUpdateCounter } = useAppStore();
  const [dbTimetable, setDbTimetable] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || 'CSE');
  const [selectedSection, setSelectedSection] = useState(user?.section || '');
  const [studentSemester, setStudentSemester] = useState<number | null>(user?.semester || null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch('/api/timetable');
        const data = await res.json();
        if (data.success) {
          setDbTimetable(data.entries || []);
        }
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
      }
    };
    fetchTimetable();
  }, [dataUpdateCounter]);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const timeSlots = [
    { time: '7:30-8:30', dbStart: '07:30' },
    { time: '8:40-9:40', dbStart: '08:40' },
    { time: '9:50-10:50', dbStart: '09:50' },
    { time: '11:00-12:00', dbStart: '11:00' },
    { time: 'LUNCH', isLunch: true },
    { time: '1:00-2:00', dbStart: '13:00' },
    { time: '2:00-3:00', dbStart: '14:00' }
  ];

  const allSections = [...new Set(dbTimetable.map(e => e.section).filter(Boolean))].sort() as string[];
  const dynamicBranches = [...new Set(allSections.map(s => s.split('-')[0]))].sort();
  const validBranch = dynamicBranches.includes(selectedBranch) ? selectedBranch : (dynamicBranches[0] || 'CSE');
  const validSections = allSections.filter(s => s.startsWith(validBranch));
  const activeSection = (validSections.includes(selectedSection) ? selectedSection : validSections[0]) || allSections[0] || '';

  const getSubjectForSlot = (day: string, section: string, timeObj: any) => {
    if (timeObj.isLunch) return 'LUNCH';
    let entry = dbTimetable.find(e => e.dayName === day && e.section === section && e.startTime === timeObj.dbStart);
    if (!entry && section.includes('-')) {
      const shortSec = section.split('-').pop();
      entry = dbTimetable.find(e => e.dayName === day && e.section === shortSec && e.startTime === timeObj.dbStart);
    }
    return entry ? entry.subject : '';
  };

  const getSubjectColor = (subject: string) => {
    if (!subject) return 'bg-gray-50 dark:bg-gray-800/50';
    if (subject.includes('LAB')) return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700';
    if (subject.includes('AR CLASS')) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    if (subject === 'LUNCH') return 'bg-gray-200 dark:bg-gray-700';
    return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">{user?.role === 'faculty' ? 'Teaching Schedule' : 'Class Timetable'}</h2>
          <p className="text-sm text-muted-foreground">
            B.Tech {getBatchFromId(user?.collegeId)} Batch{studentSemester ? ` • ${getOrdinal(studentSemester)} Semester` : ''}
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3 items-center">
            {dynamicBranches.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Branch:</Label>
                <Select value={validBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-40 rounded-xl h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dynamicBranches.map(branch => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-1 items-center gap-2">
              <Label className="text-xs font-medium">Section:</Label>
              <Select value={activeSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-full max-w-[350px] rounded-xl h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {validSections.map(section => <SelectItem key={section} value={section}>{section}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 text-left text-xs font-bold border-r w-20">DAY</th>
                {timeSlots.map((slot, i) => (
                  <th key={i} className="p-2 text-center text-xs font-medium border-r">{slot.time}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <tr key={day} className={dayIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                  <td className="p-2 text-xs font-bold border-r bg-gray-100 dark:bg-gray-800">{day}</td>
                  {timeSlots.map((slot, slotIndex) => {
                    const subject = getSubjectForSlot(day, activeSection, slot);
                    return (
                      <td key={slotIndex} className={`p-1 border-r ${slot.isLunch ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                        {subject ? (
                          <div className={`p-2 rounded-lg border text-center text-xs font-semibold ${getSubjectColor(subject)}`}>
                            {subject}
                          </div>
                        ) : <div className="text-center text-xs text-gray-300">-</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
