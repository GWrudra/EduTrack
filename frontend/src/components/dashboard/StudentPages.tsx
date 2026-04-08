'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Target, 
  BookOpen, 
  Award, 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getInitial, getOrdinal } from '@/lib/utils';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title 
} from 'chart.js';
import { Doughnut, Line as LineChart } from 'react-chartjs-2';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

// Register Chart.js components
if (typeof window !== 'undefined') {
  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);
}

// ============ INTERFACES ============

export interface CourseAttendance {
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attended: number;
  percent: number;
  semester: number;
}

export interface SemesterRecord {
  id: string;
  semester: number;
  sgpa: number;
  cgpa: number;
  creditsEarned: number;
  creditsTotal: number;
  academicYear: string;
}

export interface SubjectMarkData {
  id: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
}

export interface AttendanceRecord {
  id: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attended: number;
  percentage: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId?: string;
  targetType: 'student' | 'parent' | 'faculty' | 'all';
  title: string;
  content: string;
  messageType: 'info' | 'warning' | 'alert';
  sentAt: Date;
  isRead: boolean;
}

// ============ EXAMS COMPONENT ============

export function ExamsPage() {
  const { exams } = useAppStore();

  const upcomingExams = exams
    .filter(e => new Date(e.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Exams</h2>
        <p className="text-sm text-muted-foreground">View your exam schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {upcomingExams.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl md:col-span-2">
            <CardContent className="py-8 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No upcoming exams</p>
            </CardContent>
          </Card>
        ) : (
          upcomingExams.map((exam) => {
            const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <Card key={exam.id} className="border-0 shadow-md rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{exam.title}</h3>
                      <p className="text-xs text-muted-foreground">{exam.courseName}</p>
                    </div>
                    <Badge variant={daysLeft <= 3 ? 'destructive' : 'secondary'} className="text-[10px] rounded-lg">
                      {daysLeft}d left
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(exam.examDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.duration} min
                    </div>
                    {exam.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {exam.location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============ STATISTICS COMPONENT ============

export function StatisticsPage() {
  const { marks, courses, user } = useAppStore();
  const [selectedSemester, setSelectedSemester] = useState<number>(user?.semester || 4);

  // Semester-wise data
  const semesterData = {
    1: { cgpa: 8.2, attendance: 85, credits: 21, status: 'completed' },
    2: { cgpa: 8.5, attendance: 82, credits: 22, status: 'completed' },
    3: { cgpa: 8.1, attendance: 78, credits: 24, status: 'completed' },
    4: { cgpa: 8.7, attendance: 75, credits: 23, status: 'current' },
    5: { cgpa: 0, attendance: 0, credits: 0, status: 'upcoming' },
    6: { cgpa: 0, attendance: 0, credits: 0, status: 'upcoming' },
    7: { cgpa: 0, attendance: 0, credits: 0, status: 'upcoming' },
    8: { cgpa: 0, attendance: 0, credits: 0, status: 'upcoming' },
  };

  const currentSemester = user?.semester || 4;
  const completedSemesters = Object.entries(semesterData)
    .filter(([_, data]) => data.status === 'completed' || data.status === 'current')
    .map(([sem, _]) => parseInt(sem));

  // Get selected semester data
  const selectedData = semesterData[selectedSemester as keyof typeof semesterData];

  // Calculate overall CGPA from completed semesters
  const overallCGPA = completedSemesters.length > 0
    ? (completedSemesters.reduce((sum, sem) => sum + semesterData[sem as keyof typeof semesterData].cgpa, 0) / completedSemesters.length).toFixed(2)
    : '0.00';

  const completedCredits = completedSemesters.reduce((sum, sem) => sum + semesterData[sem as keyof typeof semesterData].credits, 0);

  const gpaData = {
    labels: completedSemesters.map(s => `Sem ${s}`),
    datasets: [{
      label: 'GPA',
      data: completedSemesters.map(s => semesterData[s as keyof typeof semesterData].cgpa),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const gradeDistribution = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [{
      data: [45, 30, 15, 8, 2],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Statistics</h2>
          <p className="text-sm text-muted-foreground">Track your academic performance</p>
        </div>
        {/* Semester Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">View:</span>
          <Select value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(parseInt(v))}>
            <SelectTrigger className="w-32 h-8 rounded-lg text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <SelectItem key={sem} value={sem.toString()}>
                  Sem {sem} {sem === currentSemester ? '(Current)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant={selectedData?.status === 'current' ? 'default' : selectedData?.status === 'completed' ? 'secondary' : 'outline'} className="text-[10px] rounded-lg">
            {selectedData?.status === 'current' ? 'Current' : selectedData?.status === 'completed' ? 'Completed' : 'Upcoming'}
          </Badge>
        </div>
      </div>

      {/* Key Metrics - Semester Specific */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">CGPA (Sem {selectedSemester})</p>
            <p className="text-2xl font-bold text-blue-600">
              {selectedData?.cgpa > 0 ? selectedData.cgpa.toFixed(2) : '-'}
            </p>
            <p className="text-[10px] text-muted-foreground">Target: 9.0</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Attendance (Sem {selectedSemester})</p>
            <p className={`text-2xl font-bold ${selectedData?.attendance >= 75 ? 'text-emerald-600' : selectedData?.attendance >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
              {selectedData?.attendance > 0 ? `${selectedData.attendance}%` : '-'}
            </p>
            <Progress value={selectedData?.attendance || 0} className="mt-1 h-1" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Overall CGPA</p>
            <p className="text-2xl font-bold text-purple-600">{overallCGPA}</p>
            <p className="text-[10px] text-muted-foreground">All semesters</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Credits</p>
            <p className="text-2xl font-bold">{completedCredits}</p>
            <Progress value={(completedCredits / 160) * 100} className="mt-1 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Semester Scorecard */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Semester Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Semester</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">CGPA</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Attendance</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Credits</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedSemesters.map((sem) => {
                  const data = semesterData[sem as keyof typeof semesterData];
                  return (
                    <tr
                      key={sem}
                      className={`border-b last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedSemester === sem ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => setSelectedSemester(sem)}
                    >
                      <td className="py-3 px-3 text-sm font-medium">Semester {sem}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={`text-xs rounded-lg ${data.cgpa >= 8 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : data.cgpa >= 6 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                          {data.cgpa.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={`text-xs rounded-lg ${data.attendance >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : data.attendance >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {data.attendance}%
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center text-sm">{data.credits}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={data.status === 'current' ? 'default' : 'secondary'} className="text-[10px] rounded-lg">
                          {data.status === 'current' ? 'Current' : 'Completed'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">CGPA Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <LineChart data={gpaData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <Doughnut data={gradeDistribution} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ ATTENDANCE DETAIL DIALOG ============

interface AttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseAttendance | null;
  allLogs: any[];
}

interface ClassAttendanceRecord {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'P' | 'A';
  topicCovered: string;
}

export function AttendanceDetailDialog({ open, onOpenChange, course, allLogs }: AttendanceDetailDialogProps) {
  const getClassRecords = (courseData: CourseAttendance): ClassAttendanceRecord[] => {
    const relevantLogs = allLogs.filter(log =>
      log.subject === courseData.courseCode || log.subject === courseData.courseName
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return relevantLogs.map((log, i) => ({
      id: log.id,
      date: new Date(log.date),
      startTime: '09:00',
      endTime: '10:40',
      status: (log.status === 'present' || log.status === 'late' ? 'P' : 'A') as 'P' | 'A',
      topicCovered: (log as any).topicCovered || ('Session ' + (relevantLogs.length - i))
    }));
  };

  const classRecords = course ? getClassRecords(course) : [];
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Class Details</DialogTitle>
          <DialogDescription>Attendance history for {course.courseName}</DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                <th className="py-2 px-3 text-left font-medium">Course Code</th>
                <th className="py-2 px-3 text-left font-medium">Course Name</th>
                <th className="py-2 px-3 text-center font-medium">Total Classes</th>
                <th className="py-2 px-3 text-center font-medium">Classes Attended</th>
                <th className="py-2 px-3 text-center font-medium">Percentage(%)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <td className="py-2 px-3 font-medium">{course.courseCode}</td>
                <td className="py-2 px-3">{course.courseName}</td>
                <td className="py-2 px-3 text-center">{course.totalClasses}</td>
                <td className="py-2 px-3 text-center">{course.attended}</td>
                <td className="py-2 px-3 text-center font-bold">{course.percent}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[300px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Sl#</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Start Time</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">End Time</th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-muted-foreground">Course Covered</th>
                </tr>
              </thead>
              <tbody>
                {classRecords.map((record, index) => (
                  <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-2 px-3 text-xs">{index + 1}</td>
                    <td className="py-2 px-3 text-xs">{new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td className="py-2 px-3 text-xs">{record.startTime}</td>
                    <td className="py-2 px-3 text-xs">{record.endTime}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${record.status === 'P'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs">{record.topicCovered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <p className="text-xs text-muted-foreground flex-1">
            Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()} className="rounded-xl">
              Print
            </Button>
            <Button onClick={() => onOpenChange(false)} className="rounded-xl bg-slate-500 hover:bg-slate-600">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ ATTENDANCE & CGPA PAGE (Student) ============

export function AttendanceCGPAPage() {
  const { user, dataUpdateCounter } = useAppStore();
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [performanceSemester, setPerformanceSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseAttendance | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [semesterRecords, setSemesterRecords] = useState<SemesterRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMarkData[]>([]);
  const [stats, setStats] = useState({ currentCGPA: 0, currentSGPA: 0, overallAttendance: 0, totalCredits: 0 });

  useEffect(() => {
    const fetchAcademicData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/academic?studentId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          setSemesterRecords(data.data.semesterRecords || []);
          setAttendanceRecords(data.data.attendanceRecords || []);
          setAttendanceLogs(data.data.attendanceLogs || []);
          setSubjectMarks(data.data.subjectMarks || []);
          setStats(data.data.stats || { currentCGPA: 0, currentSGPA: 0, overallAttendance: 0, totalCredits: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch academic data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademicData();
  }, [user?.id, dataUpdateCounter]);

  const semesterData: Record<number, CourseAttendance[]> = {};
  attendanceRecords.forEach(record => {
    if (!semesterData[record.semester]) {
      semesterData[record.semester] = [];
    }
    semesterData[record.semester].push({
      courseCode: record.subjectCode,
      courseName: record.subjectName,
      totalClasses: record.totalClasses,
      attended: record.attended,
      percent: record.percentage,
      semester: record.semester,
    });
  });

  const allSemesters = Object.keys(semesterData).map(Number).sort((a, b) => b - a);
  const recentSemesters = allSemesters.slice(0, 2);
  const filteredSemesters = selectedSemester === 'all' ? recentSemesters : [parseInt(selectedSemester)];
  const recentSemesterRecords = semesterRecords.sort((a, b) => b.semester - a.semester);
  const availableSemesters = recentSemesterRecords.map(r => r.semester).sort((a, b) => b - a); // All sem results
  const attendanceSemesterOptions = recentSemesters; // Only 2 recent for attendance dropdown

  const cgpaChartData = {
    labels: availableSemesters.slice().reverse().map(s => `Sem ${s}`),
    datasets: [{
      label: 'SGPA',
      data: availableSemesters.slice().reverse().map(s => {
        const record = recentSemesterRecords.find(r => r.semester === s);
        return record?.sgpa || 0;
      }),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const totalClasses = attendanceRecords.reduce((sum, r) => sum + r.totalClasses, 0);
  const totalAttended = attendanceRecords.reduce((sum, r) => sum + r.attended, 0);
  const overallAttendancePercent = stats.overallAttendance || (totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0);

  if (loading) {
     return (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Attendance & CGPA</h2>
          <p className="text-sm text-muted-foreground">Track your academic performance</p>
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-32 rounded-xl h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Recent Semesters</SelectItem>
            {attendanceSemesterOptions.map(s => (
              <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className={`text-2xl font-bold ${overallAttendancePercent >= 75 ? 'text-green-600' : overallAttendancePercent >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
              {overallAttendancePercent}%
            </p>
            <Progress value={overallAttendancePercent} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground">CGPA</p>
            <p className="text-2xl font-bold text-purple-600">{stats.currentCGPA}</p>
            <p className="text-xs text-muted-foreground mt-1">Target: 9.0</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground">Total Classes</p>
            <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground">Credits</p>
            <p className="text-2xl font-bold text-orange-600">{stats.totalCredits}</p>
          </CardContent>
        </Card>
      </div>

      {filteredSemesters.sort((a, b) => b - a).map((semester) => (
        <Card key={semester} className="border-0 shadow-md rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-500 to-slate-600 px-4 py-3">
            <h3 className="text-white font-semibold">Semester {semester}</h3>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b">
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Course Code</th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium text-muted-foreground">Course Name</th>
                    <th className="py-2.5 px-3 text-center text-xs font-medium text-muted-foreground">Total Classes</th>
                    <th className="py-2.5 px-3 text-center text-xs font-medium text-muted-foreground">Classes Attended</th>
                    <th className="py-2.5 px-3 text-center text-xs font-medium text-muted-foreground">Percentage(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {semesterData[semester]?.map((course, index) => (
                    <tr
                      key={course.courseCode}
                      className={`border-b last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
                      onClick={() => { setSelectedCourse(course); setShowDetailDialog(true); }}
                    >
                      <td className="py-2.5 px-3 text-sm font-medium text-slate-600">{course.courseCode}</td>
                      <td className="py-2.5 px-3 text-sm">{course.courseName}</td>
                      <td className="py-2.5 px-3 text-sm text-center">{course.totalClasses}</td>
                      <td className="py-2.5 px-3 text-sm text-center">{course.attended}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-xs rounded-lg ${course.percent >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : course.percent >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {course.percent}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">CGPA Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <LineChart data={cgpaChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col gap-4">
        {performanceSemester === 'all' ? (
          <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-900 border-b">
              <CardTitle className="text-sm font-semibold">Published Result List Summary</CardTitle>
              <CardDescription className="text-xs mt-1">Select an examination to view detailed results</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-16">Sl#</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Examination</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-32 whitespace-nowrap">Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableSemesters.length === 0 ? (
                      <tr><td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">No examination results published yet.</td></tr>
                    ) : (
                      availableSemesters.map((sem, idx) => {
                        const record = recentSemesterRecords.find(r => r.semester === sem);
                        const actualSem = sem > 8 ? (sem % 2 === 0 ? 2 : 1) : sem;
                        const semString = actualSem === 1 ? '1st' : actualSem === 2 ? '2nd' : actualSem === 3 ? '3rd' : actualSem + 'th';
                        // Enrollment-based session calculation logic
                        const enrollmentYear = parseInt(user?.collegeId?.substring(0, 4) || '2023');
                        const startYear = isNaN(enrollmentYear) ? 2023 : enrollmentYear;
                        const semYear = startYear + Math.floor((sem - 1) / 2);
                        const semSession = `${semYear}-${(semYear + 1).toString().slice(-2)}`;
                        
                        const examName = `BTech (${user?.branch || 'CSE'}) ${semString} Semester, ${semYear}`;
                        return (
                          <tr key={sem} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => setPerformanceSemester(sem.toString())}>
                            <td className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">{idx + 1}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{examName}</td>
                            <td className="py-3 px-4 text-center text-sm text-muted-foreground font-medium">{record?.academicYear && record.academicYear !== '2024-25' ? record.academicYear : semSession}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
           (() => {
              const sem = parseInt(performanceSemester);
              const record = recentSemesterRecords.find(r => r.semester === sem);
              const mfs = subjectMarks.filter(m => m.semester === sem);
              const actualSem = sem > 8 ? (sem % 2 === 0 ? 2 : 1) : sem;
              const semString = actualSem === 1 ? '1st' : actualSem === 2 ? '2nd' : actualSem === 3 ? '3rd' : actualSem + 'th';
              
              const enrollmentYear = parseInt(user?.collegeId?.substring(0, 4) || '2023');
              const startYear = isNaN(enrollmentYear) ? 2023 : enrollmentYear;
              const semYear = startYear + Math.floor((sem - 1) / 2);
              
              const examName = `BTech (${user?.branch || 'CSE'}) ${semString} Semester, ${semYear}`;
              return (
                <Card className="border-0 shadow-md rounded-2xl overflow-hidden min-w-full">
                  <CardHeader className="pb-3 border-b bg-slate-50 dark:bg-slate-900 flex flex-row items-center justify-between">
                    <div><CardTitle className="text-sm font-semibold">Result Sheet</CardTitle><CardDescription className="text-xs mt-1">Detailed subject-wise performance</CardDescription></div>
                    <Button variant="outline" size="sm" className="h-8 rounded-xl" onClick={() => setPerformanceSemester('all')}><ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back</Button>
                  </CardHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-sm bg-slate-50/50 dark:bg-slate-900/20">
                     <div className="space-y-1">
                        <p><span className="text-muted-foreground">Examination:</span> <span className="font-semibold">{examName}</span></p>
                        <p><span className="text-muted-foreground">Reg No:</span> <span className="font-semibold">{user?.collegeId}</span></p>
                     </div>
                     <div className="space-y-1">
                        <p><span className="text-muted-foreground">Student Name:</span> <span className="font-semibold">{user?.name}</span></p>
                        <p><span className="text-muted-foreground">Published On:</span> <span className="font-semibold">{new Date().toLocaleDateString('en-GB')}</span></p>
                     </div>
                  </div>
                  <CardContent className="p-0">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 border-b">
                        <tr><th className="p-3 text-center w-12">#</th><th className="p-3">Code</th><th>Subject Name</th><th className="p-3 text-center">Credit</th><th className="p-3 text-center">Grade</th></tr>
                      </thead>
                      <tbody>
                        {mfs.map((mark, idx) => (
                          <tr key={mark.id} className="border-b last:border-0">
                            <td className="p-3 text-center text-muted-foreground">{idx+1}</td>
                            <td className="p-3 font-mono">{mark.subjectCode}</td>
                            <td className="p-3 font-medium">{mark.subjectName}</td>
                            <td className="p-3 text-center">{mark.credits || 4}</td>
                            <td className="p-3 text-center">
                              <Badge variant="outline" className={`${mark.grade?.startsWith('A')||mark.grade?.startsWith('O') ? 'bg-green-50 text-green-700' : mark.grade==='F' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>{mark.grade}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 dark:bg-slate-900 font-bold border-t">
                        <tr><td colSpan={3}></td><td className="p-3 text-center">Total: {record?.creditsEarned || mfs.reduce((s,m)=>s+(m.credits||4), 0)}</td><td className="p-3 text-center">SGPA: {record?.sgpa?.toFixed(2)}</td></tr>
                      </tfoot>
                    </table>
                  </CardContent>
                </Card>
              );
           })()
        )}
      </div>

      <AttendanceDetailDialog open={showDetailDialog} onOpenChange={setShowDetailDialog} course={selectedCourse} allLogs={attendanceLogs} />
    </div>
  );
}

// ============ MESSAGES COMPONENT ============

export function MessagesPage() {
  const { messages, user, setMessages, addMessage } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning' | 'alert' | 'info'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTabState] = useState<'messages' | 'contact'>('messages');

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch('/api/users?role=faculty');
        const data = await res.json();
        if (data.success && data.users) {
          setFacultyMembers(data.users.map((f: any) => ({
            id: f.id,
            name: f.name,
            department: f.department || 'General',
            subject: f.department || 'General',
          })));
        }
      } catch (error) { console.error(error); }
    };
    fetchFaculty();
  }, []);

  const userMessages = user?.role === 'student'
    ? messages.filter(m => m.senderId === user.id || m.receiverId === user.id || m.targetType === 'student' || m.targetType === 'all')
    : messages;

  const filteredMessages = userMessages.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !m.isRead;
    return m.messageType === filter;
  });

  const unreadCount = userMessages.filter(m => !m.isRead).length;

  const handleSendMessage = async () => {
    if (!selectedTeacher || !contactSubject || !contactMessage) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: selectedTeacher,
          targetType: 'faculty',
          title: contactSubject,
          content: contactMessage,
          messageType: 'info'
        })
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success(`Message sent!`);
        setSelectedTeacher(''); setContactSubject(''); setContactMessage('');
      } else { toast.error(data.message || 'Failed to send message'); }
    } catch { toast.error('Failed to send message'); }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getMessageBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'alert': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Messages</h2>
          <p className="text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => setMessages(messages.map(m=>({...m, isRead:true})))} className="rounded-xl"><CheckCircle2 className="w-4 h-4 mr-2" /> Mark all read</Button>}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTabState(v as any)}>
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="messages" className="rounded-lg">Messages</TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg">Contact Teachers</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-2 mt-4">
           {/* Filters simplified */}
           <div className="flex gap-2 mb-4 overflow-x-auto">
              {['all', 'unread', 'warning', 'alert'].map(f => (
                <Button key={f} size="sm" variant={filter===f ? 'default' : 'outline'} onClick={()=>setFilter(f as any)} className="rounded-xl capitalize">{f}</Button>
              ))}
           </div>
           {filteredMessages.length === 0 ? <Card className="p-12 text-center text-muted-foreground"><MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" /> No messages</Card> : 
             filteredMessages.map(m => (
               <Card key={m.id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${!m.isRead ? 'border-primary/20 bg-primary/5' : ''}`} onClick={()=>{setSelectedMessage(m); if(!m.isRead) setMessages(messages.map(x=>x.id===m.id?{...x,isRead:true}:x))}}>
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getMessageBg(m.messageType)}`}>{getMessageIcon(m.messageType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-medium">
                          <span>{m.title}</span>
                          {m.senderName && <span className="text-[10px] font-normal text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">From: {m.senderName}</span>}
                          {!m.isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.content}</p>
                      <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] rounded-lg">{m.messageType}</Badge>
                        <span>{new Date(m.sentAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
               </Card>
             ))
           }
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
           <Card className="p-4 space-y-4">
              <div className="space-y-2">
                 <Label>Teacher</Label>
                 <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                       {facultyMembers.map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.subject})</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label>Subject</Label>
                 <Input value={contactSubject} onChange={e=>setContactSubject(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                 <Label>Message</Label>
                 <Textarea value={contactMessage} onChange={e=>setContactMessage(e.target.value)} rows={4} className="rounded-xl" />
              </div>
              <Button onClick={handleSendMessage} className="w-full rounded-xl" disabled={!selectedTeacher || !contactSubject || !contactMessage}><Send className="w-4 h-4 mr-2" /> Send Message</Button>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedMessage} onOpenChange={o=>!o&&setSelectedMessage(null)}>
         <DialogContent className="rounded-2xl">
            {selectedMessage && (
              <>
                <DialogHeader><DialogTitle>{selectedMessage.title}</DialogTitle><DialogDescription>From {selectedMessage.senderName} • {new Date(selectedMessage.sentAt).toLocaleString()}</DialogDescription></DialogHeader>
                <div className="p-4 bg-muted rounded-xl text-sm whitespace-pre-wrap">{selectedMessage.content}</div>
                <DialogFooter><Button onClick={()=>setSelectedMessage(null)} className="rounded-xl">Close</Button></DialogFooter>
              </>
            )}
         </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ SETTINGS COMPONENT ============

export function SettingsPage() {
  const { importData } = useAppStore();
  const { theme, setTheme } = useTheme();

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export');
      const data = await res.json();
      if (!data.success) { toast.error('Export failed'); return; }
      const blob = new Blob([JSON.stringify(data.exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `edutrack-backup.json`; a.click();
      toast.success('Backup exported');
    } catch { toast.error('Failed to export'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Settings</h2>
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Theme</p><p className="text-xs text-muted-foreground">Switch between light and dark mode</p></div>
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            <Button size="sm" variant={theme==='light'?'default':'ghost'} onClick={()=>setTheme('light')} className="rounded-lg"><Sun className="w-4 h-4 mr-1"/>Light</Button>
            <Button size="sm" variant={theme==='dark'?'default':'ghost'} onClick={()=>setTheme('dark')} className="rounded-lg"><Moon className="w-4 h-4 mr-1"/>Dark</Button>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
           <div><p className="font-medium">Data Backup</p><p className="text-xs text-muted-foreground">Download all your academic and personal data</p></div>
           <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl">Export JSON</Button>
        </div>
      </Card>
      <Card className="p-4"><p className="text-sm font-medium">About EduTrack</p><p className="text-xs text-muted-foreground mt-1">Version 1.0.0 • Student Affairs Management System</p></Card>
    </div>
  );
}
