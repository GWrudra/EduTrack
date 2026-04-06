'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BookOpen, Calendar, Clock, MapPin, CheckCircle2, Award, Target, UserCheck, AlertTriangle
} from 'lucide-react';
import { DailyQuoteCard } from '@/components/features/FeaturesComponents';

export function StudentDashboard() {
  const { courses, assignments, user, dataUpdateCounter } = useAppStore();
  const [stats, setStats] = useState({ currentCGPA: 0, overallAttendance: 0 });
  const [dynamicPoints, setDynamicPoints] = useState({ totalPoints: 0 });

  useEffect(() => {
    const fetchAcademicData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/academic?studentId=${user.id}`);
        const data = await res.json();
        if (data.success && data.data.stats) {
          setStats(data.data.stats);

          if (data.data.points) {
            setDynamicPoints({
              totalPoints: data.data.points.totalPoints
            });
          } else {
            setDynamicPoints({ totalPoints: 0 });
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchAcademicData();
  }, [user?.id, dataUpdateCounter]);

  const [todayCourses, setTodayCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchTodayCourses = async () => {
      if (!user?.section) return;
      try {
        const formattedSection = user.section.includes('-')
          ? user.section
          : `${user.branch || ''}-${user.section}`;

        const res = await fetch(`/api/timetable?section=${formattedSection.toUpperCase()}`);
        const data = await res.json();
        if (data.success && data.entries) {
          const today = new Date().getDay();
          const todayMapped = today === 0 ? 0 : today; // 0 is Sunday, 1 is Monday etc
          const filtered = data.entries.filter((e: any) => e.dayOfWeek === todayMapped);
          const sorted = filtered.sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
          const merged: any[] = [];
          for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];
            const last = merged[merged.length - 1];
            if (last && (last.subject === current.subject)) {
              last.endTime = current.endTime;
            } else {
              merged.push({ ...current });
            }
          }
          setTodayCourses(merged);
        }
      } catch (error) {
        console.error('Failed to fetch today courses:', error);
      }
    };
    fetchTodayCourses();
  }, [user?.section, dataUpdateCounter]);

  const attendancePercent = stats.overallAttendance || 0;
  const cgpa = stats.currentCGPA ? stats.currentCGPA.toFixed(2) : '0.00';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRiskLevel = () => {
    if (attendancePercent < 40) return { level: 'High', color: 'text-red-500', bg: 'bg-red-500', ring: 'ring-red-500' };
    if (attendancePercent < 60) return { level: 'Medium', color: 'text-orange-500', bg: 'bg-orange-500', ring: 'ring-orange-500' };
    return { level: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-500' };
  };

  const riskInfo = getRiskLevel();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight">{user?.name || 'Student'}</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{new Date().getDate()}</div>
          <div className="text-xs text-muted-foreground uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
          <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">CGPA</span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{cgpa}</div>
            <div className="mt-2 h-1.5 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(parseFloat(cgpa as string) / 10) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Attendance</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{attendancePercent}%</div>
            <div className="mt-2 h-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${attendancePercent}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Points</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{dynamicPoints.totalPoints}</div>
            <div className="mt-2 h-1.5 bg-amber-100 dark:bg-amber-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${Math.min((dynamicPoints.totalPoints / 300) * 100, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${riskInfo.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk Status</p>
              <p className={`text-lg font-bold ${riskInfo.color}`}>{riskInfo.level} Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Classes Today</p>
              <p className="text-lg font-bold">{todayCourses.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayCourses.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-30" />
              <p className="font-medium">No Classes Today</p>
              <p className="text-sm text-muted-foreground">Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayCourses.map((course, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.subject}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{course.startTime} - {course.endTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DailyQuoteCard />
    </div>
  );
}
