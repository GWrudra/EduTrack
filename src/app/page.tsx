'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore, User, Course, Assignment, Exam, Mark, StudentRiskInfo, Message, DailyQuote } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BookOpen, Calendar, ClipboardList, BarChart3, Settings, LogOut,
  Menu, X, Bell, ChevronRight, Upload, FileText, Users, AlertTriangle,
  Clock, MapPin, Plus, Trash2, Edit, CheckCircle2, Circle, RefreshCw,
  TrendingUp, Award, Target, MessageSquare, Send, Download,
  Sun, Moon, Search, Eye, Phone, Home, Database,
  GraduationCap, UserCheck, AlertCircle, ChevronLeft, LayoutDashboard, Mail, Key
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Line as LineChart, Bar as BarChart } from 'react-chartjs-2';

// Register Chart.js components
if (typeof window !== 'undefined') {
  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);
}

// ============ AUTH COMPONENTS ============

function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [collegeId, setCollegeId] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId, password }),
      });

      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
        toast.success('Login successful!');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white">
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mt-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">EduTrack</CardTitle>
          <CardDescription className="text-slate-100">Student Affairs Management</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collegeId">Roll No / Faculty ID</Label>
                <Input
                  id="collegeId"
                  placeholder="Enter your ID"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="flex justify-center">
                <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-slate-600 hover:text-slate-700 transition-colors">
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            <ForgotPassword onBack={() => setShowForgot(false)} />
          )}

          <Separator className="my-4" />
          <div className="text-center text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Admin: <span className="font-mono">ADMIN</span> / <span className="font-mono">admin123</span></p>
            <p>Student: <span className="font-mono">CSE001</span> / <span className="font-mono">password123</span></p>
            <p>Faculty: <span className="font-mono">T001</span> / <span className="font-mono">password123</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId, email }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        toast.success('Reset link sent to your email');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-muted-foreground">Check your email for the reset link</p>
        <Button variant="outline" onClick={onBack} className="rounded-xl">Back to Login</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Roll No / Faculty ID</Label>
        <Input placeholder="Enter your ID" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input type="email" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 rounded-xl">Back</Button>
        <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </div>
    </form>
  );
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { token } = useAppStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Password changed successfully');
        onOpenChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Enter your current password and new password</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">{loading ? 'Changing...' : 'Change Password'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ STUDENT DETAILS DIALOG (Faculty) ============

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRiskInfo | null;
  onSendWarning?: () => void;
  onAlertParent?: () => void;
}

function StudentDetailsDialog({ open, onOpenChange, student, onSendWarning, onAlertParent }: StudentDetailsDialogProps) {
  const [showWarningForm, setShowWarningForm] = useState(false);
  const [showParentForm, setShowParentForm] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [parentMessage, setParentMessage] = useState('');
  const { addMessage, user } = useAppStore();

  if (!student) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      toast.error('Please enter a warning message');
      return;
    }
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: student.id,
          targetType: 'student',
          title: `Warning for ${student.name}`,
          content: warningMessage,
          messageType: 'warning',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Warning sent to student');
        setWarningMessage('');
        setShowWarningForm(false);
        onSendWarning?.();
      } else {
        toast.error(data.message || 'Failed to send warning');
      }
    } catch {
      toast.error('Failed to send warning');
    }
  };

  const handleAlertParent = async () => {
    if (!parentMessage.trim()) {
      toast.error('Please enter a message for parent');
      return;
    }
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: student.id,
          targetType: 'parent',
          title: `Alert regarding ${student.name}`,
          content: parentMessage,
          messageType: 'alert',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Parent alerted successfully');
        setParentMessage('');
        setShowParentForm(false);
        onAlertParent?.();
      } else {
        toast.error(data.message || 'Failed to send parent alert');
      }
    } catch {
      toast.error('Failed to send parent alert');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{student.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{student.collegeId}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="font-medium text-sm">{student.branch}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Section</p>
              <p className="font-medium text-sm">{student.section}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Year</p>
              <p className="font-medium text-sm">{student.year}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Risk Level</p>
              <Badge className={`${getRiskColor(student.riskLevel)} text-xs mt-0.5`}>
                {student.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="text-lg font-bold text-blue-600">{student.attendance}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
              <p className="text-xs text-muted-foreground">CGPA</p>
              <p className="text-lg font-bold text-purple-600">{(student.cgpa ?? 0).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20 text-center">
              <p className="text-xs text-muted-foreground">Total Pts</p>
              <p className="text-lg font-bold text-slate-600">{(student as any).totalPoints ?? 0}<span className="text-xs font-normal text-muted-foreground">/130</span></p>
            </div>
          </div>

          {/* Risk Point Breakdown */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score Breakdown</p>

            {/* Attendance Points */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Attendance Points</span>
                <span className="font-semibold text-blue-600">{(student as any).attPoints ?? 0}<span className="text-muted-foreground font-normal">/50</span></span>
              </div>
              <Progress value={((student as any).attPoints ?? 0) / 50 * 100} className="h-1.5 bg-blue-100" />
            </div>

            {/* CGPA Points */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CGPA Points</span>
                <span className="font-semibold text-purple-600">{(student as any).cgpaPoints ?? 0}<span className="text-muted-foreground font-normal">/50</span></span>
              </div>
              <Progress value={((student as any).cgpaPoints ?? 0) / 50 * 100} className="h-1.5 bg-purple-100" />
            </div>

            {/* Consistency Points */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consistency Points</span>
                <span className="font-semibold text-green-600">{(student as any).consistencyPoints ?? 0}<span className="text-muted-foreground font-normal">/30</span></span>
              </div>
              <Progress value={((student as any).consistencyPoints ?? 0) / 30 * 100} className="h-1.5 bg-green-100" />
            </div>

            {/* Overall Risk Score */}
            <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">Overall Risk Score</p>
                <p className="font-bold text-sm">{student.riskScore.toFixed(0)}%</p>
              </div>
              <Progress
                value={student.riskScore}
                className={`h-2 ${student.riskLevel === 'high' ? 'bg-red-100' : student.riskLevel === 'medium' ? 'bg-orange-100' : 'bg-green-100'}`}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Higher score = Lower risk (more points earned)</p>
            </div>
          </div>

          {/* Risk Factors */}
          {(student as any).factors && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Risk Factors</p>
              {((student as any).factors as string).split(',').filter(Boolean).map((f: string, i: number) => (
                <p key={i} className="text-xs text-red-600 dark:text-red-400">• {f.trim()}</p>
              ))}
            </div>
          )}


          {/* Action Buttons */}
          <Separator />

          {!showWarningForm && !showParentForm ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-1 rounded-xl border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => setShowWarningForm(true)}
              >
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-xs">Send Warning</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3 flex-col gap-1 rounded-xl border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => setShowParentForm(true)}
              >
                <Phone className="w-5 h-5 text-red-500" />
                <span className="text-xs">Alert Parent</span>
              </Button>
            </div>
          ) : showWarningForm ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Warning Message</Label>
              <Textarea
                placeholder="Enter warning message for student..."
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowWarningForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={handleSendWarning} className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600">Send Warning</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Message to Parent</Label>
              <Textarea
                placeholder="Enter message for parent..."
                value={parentMessage}
                onChange={(e) => setParentMessage(e.target.value)}
                className="rounded-xl"
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowParentForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={handleAlertParent} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600">Alert Parent</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ POINTS PAGE (Student) ============

function PointsPage() {
  const { user, dataUpdateCounter } = useAppStore();
  const [dynamicPoints, setDynamicPoints] = useState({ totalPoints: 0, academicPoints: 0, socialPoints: 0 });
  const [stats, setStats] = useState({ cgpa: 0, avgScore: 0, topScore: 0, subjectCount: 0 });

  useEffect(() => {
    const fetchAcademicData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/academic?studentId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          const marks = data.data.subjectMarks || [];
          const totalMarks = marks.reduce((sum: number, m: any) => sum + (m.totalMarks || 0), 0);
          const avgScore = marks.length > 0 ? (totalMarks / marks.length).toFixed(1) : 0;
          const topScore = marks.length > 0 ? Math.max(...marks.map((m: any) => m.totalMarks || 0)) : 0;

          setStats({
            cgpa: data.data.stats?.currentCGPA || 0,
            avgScore: Number(avgScore),
            topScore: topScore,
            subjectCount: marks.length
          });

          const idHash = user.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          const academicPts = Math.floor((data.data.stats?.currentCGPA || 7) * 10);
          const socialPts = (idHash % 50) + 20;
          setDynamicPoints({
            totalPoints: academicPts + socialPts + 100, // Base
            academicPoints: academicPts + 80,
            socialPoints: socialPts + 20
          });
        }
      } catch (error) {
        console.error('Failed to fetch academic data:', error);
      }
    };
    fetchAcademicData();
  }, [user?.id, dataUpdateCounter]);

  const level = Math.floor(dynamicPoints.totalPoints / 50) + 1;
  const pointsToNextLevel = (level * 50) - dynamicPoints.totalPoints;
  const progress = ((dynamicPoints.totalPoints % 50) / 50) * 100;

  // Scorecard data
  const scorecardData = [
    { label: 'CGPA', value: stats.cgpa ? stats.cgpa.toFixed(2) : '0.00', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Avg Score', value: `${stats.avgScore}%`, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Highest', value: `${stats.topScore}`, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Subjects', value: stats.subjectCount.toString(), color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Points Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track your achievements and progress</p>
        </div>
        <Badge className="rounded-xl px-4 py-1.5 text-sm bg-gradient-to-r from-slate-500 to-slate-600">
          Level {level}
        </Badge>
      </div>

      {/* Level Progress */}
      <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-90">Current Level</p>
              <p className="text-3xl font-bold">{level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Points</p>
              <p className="text-3xl font-bold">{dynamicPoints.totalPoints}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/30" />
          <p className="text-xs mt-2 opacity-90">{pointsToNextLevel} points to next level</p>
        </CardContent>
      </Card>

      {/* Scorecard */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Academic Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {scorecardData.map((item) => (
              <div key={item.label} className={`p-4 rounded-xl ${item.bg} text-center`}>
                <p className="text-2xl font-bold {item.color}">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points Overview */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Points Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Academic Points</p>
                <p className="font-bold">{dynamicPoints.academicPoints}</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bonus Points</p>
                <p className="font-bold">{Math.max(0, dynamicPoints.totalPoints - dynamicPoints.academicPoints)}</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ NOTIFICATIONS DIALOG ============

function NotificationsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { messages, user } = useAppStore();

  // Filter messages for the current user (student gets messages sent to them or all students)
  const userMessages = user?.role === 'student'
    ? messages.filter(m => m.receiverId === user.id || m.targetType === 'student' || m.targetType === 'all')
    : messages;

  const unreadCount = userMessages.filter(m => !m.isRead).length;

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs rounded-full ml-2">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {user?.role === 'student' ? 'Your messages and alerts' : 'Sent messages'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6">
          <div className="px-6 pb-4 space-y-2">
            {userMessages.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              userMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-xl border ${!message.isRead ? 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getMessageBg(message.messageType)}`}>
                      {getMessageIcon(message.messageType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{message.title}</h4>
                        {!message.isRead && (
                          <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                        )}
                      </div>
                      {message.senderName && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                          from {message.senderName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-[10px] rounded-lg">
                          {message.targetType === 'student' ? 'To Student' :
                            message.targetType === 'parent' ? 'To Parent' : 'To All'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(message.sentAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ============ DAILY QUOTE COMPONENT ============

function DailyQuoteCard() {
  const { dailyQuote, setDailyQuote } = useAppStore();

  const refreshQuote = () => {
    const quotes: DailyQuote[] = [
      { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
      { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
      { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
      { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    ];
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-900/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 bg-slate-500">
            <AvatarFallback className="bg-slate-500 text-white font-bold">
              {dailyQuote.author?.charAt(0) || 'Q'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/80 italic leading-relaxed">{dailyQuote.quote}</p>
            {dailyQuote.author && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">— {dailyQuote.author}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={refreshQuote} className="shrink-0 rounded-full h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ SIDEBAR COMPONENT (Desktop) ============

function DesktopSidebar() {
  const { user, activeTab, setActiveTab, sidebarCollapsed, toggleSidebarCollapsed, logout } = useAppStore();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'points', label: 'Points', icon: Award },
    { id: 'attendance-cgpa', label: 'Attendance & CGPA', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const facultyMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'risk-analysis', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'messaging', label: 'Messaging', icon: Send },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'import', label: 'Import Data', icon: Upload },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : user?.role === 'faculty' ? facultyMenuItems : studentMenuItems;

  // Get unread notifications count
  const { messages } = useAppStore();
  const userMessages = user?.role === 'student'
    ? messages.filter(m => m.receiverId === user.id || m.targetType === 'student' || m.targetType === 'all')
    : messages;
  const unreadCount = userMessages.filter(m => !m.isRead).length;

  return (
    <>
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-slate-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">EduTrack</h1>
                <p className="text-xs text-muted-foreground">Student Affairs</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-slate-500/20">
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.collegeId}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs rounded-lg">
                {user?.role === 'faculty' ? user.department : user?.branch}
              </Badge>
              {user?.role === 'student' && (
                <Badge variant="outline" className="text-xs rounded-lg">
                  Year {user?.year} - {user?.section}
                </Badge>
              )}
              {user?.role === 'student' && user?.semester && (
                <Badge variant="outline" className="text-xs rounded-lg border-slate-300 dark:border-slate-600">
                  Semester {user.semester}
                </Badge>
              )}
            </div>
            {user?.role === 'student' && user?.loginTime && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Logged in: {new Date(user.loginTime).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''
                  } ${activeTab === item.id
                    ? 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 shadow-sm'
                    : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'
                  }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-slate-500' : ''}`} />
                {!sidebarCollapsed && item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle & Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Button
            variant="ghost"
            onClick={toggleSidebarCollapsed}
            className={`w-full rounded-xl ${sidebarCollapsed ? 'justify-center' : 'justify-start'} text-muted-foreground hover:text-foreground`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>

          {!sidebarCollapsed && (
            <>
              <Button variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground hover:text-foreground" onClick={() => setShowChangePassword(true)}>
                <Settings className="w-5 h-5 mr-2" />
                Change Password
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </>
          )}

          {sidebarCollapsed && (
            <>
              <Button variant="ghost" size="icon" className="w-full rounded-xl" onClick={() => setShowChangePassword(true)} title="Change Password">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-full rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout} title="Logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </aside>

      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      <NotificationsDialog open={showNotifications} onOpenChange={setShowNotifications} />
    </>
  );
}

// ============ MOBILE BOTTOM NAV ============

function MobileBottomNav() {
  const { user, activeTab, setActiveTab } = useAppStore();

  const studentMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
    { id: 'points', label: 'Points', icon: Award },
    { id: 'attendance-cgpa', label: 'Stats', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'More', icon: Settings },
  ];

  const facultyMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attend.', icon: UserCheck },
    { id: 'risk-analysis', label: 'Risk', icon: AlertTriangle },
    { id: 'settings', label: 'More', icon: Settings },
  ];

  const menuItems = user?.role === 'faculty' ? facultyMenuItems : studentMenuItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${activeTab === item.id
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-muted-foreground'
              }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-slate-100 dark:bg-slate-900/30' : ''
              }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============ MOBILE HEADER ============

function MobileHeader() {
  const { user, logout } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleChangePassword = () => {
    setShowMenu(false);
    setShowChangePassword(true);
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">EduTrack</h1>
              <p className="text-[10px] text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowMenu(true)} className="rounded-full h-9 w-9">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="rounded-t-3xl max-w-full mx-0 mb-0 fixed bottom-0 top-auto translate-y-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Avatar className="w-12 h-12 ring-2 ring-slate-500/20">
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.collegeId}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12" onClick={handleChangePassword}>
              <Settings className="w-5 h-5 mr-3" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
    </>
  );
}

// ============ STUDENT DASHBOARD ============

function StudentDashboard() {
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

          // Generate unique pseudo-random points based on student ID to show varied data per user
          const idHash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const academicScore = data.data.stats.currentCGPA || 7;
          setDynamicPoints({
            totalPoints: 120 + (idHash % 100) + Math.floor(academicScore * 10)
          });
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
        const res = await fetch(`/api/timetable?section=${user.section}`);
        const data = await res.json();
        if (data.success && data.entries) {
          const today = new Date().getDay();
          const todayMapped = today === 0 ? 0 : today; // 0 is Sunday, 1 is Monday etc
          setTodayCourses(data.entries.filter((e: any) => e.dayOfWeek === todayMapped));
        }
      } catch (error) {
        console.error('Failed to fetch today courses:', error);
      }
    };
    fetchTodayCourses();
  }, [user?.section]);

  const attendancePercent = stats.overallAttendance || 0;
  const cgpa = stats.currentCGPA ? stats.currentCGPA.toFixed(2) : '0.00';
  const upcomingAssignments = assignments
    .filter(a => new Date(a.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Risk level calculation
  const getRiskLevel = () => {
    if (attendancePercent < 40) return { level: 'High', color: 'text-red-500', bg: 'bg-red-500', ring: 'ring-red-500' };
    if (attendancePercent < 60) return { level: 'Medium', color: 'text-orange-500', bg: 'bg-orange-500', ring: 'ring-orange-500' };
    return { level: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-500' };
  };

  const riskInfo = getRiskLevel();

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight">{user?.name || 'Student'}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className="rounded-md text-xs font-medium">
              {user?.branch}
            </Badge>
            <Badge variant="outline" className="rounded-md text-xs">
              Sem {user?.semester || 4}
            </Badge>
            <Badge variant="outline" className="rounded-md text-xs">
              Sec {user?.section}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{new Date().getDate()}</div>
          <div className="text-xs text-muted-foreground uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
          <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* CGPA Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">CGPA</span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{cgpa}</div>
            <div className="mt-2 h-1.5 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: `${(parseFloat(cgpa as string) / 10) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Attendance</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{attendancePercent}%</div>
            <div className="mt-2 h-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${attendancePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Points Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Points</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{dynamicPoints.totalPoints}</div>
            <div className="mt-2 h-1.5 bg-amber-100 dark:bg-amber-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                style={{ width: `${Math.min((dynamicPoints.totalPoints / 300) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Risk Status */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${riskInfo.bg}/10 flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${riskInfo.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk Status</p>
              <p className={`text-lg font-bold ${riskInfo.color}`}>{riskInfo.level} Risk</p>
            </div>
          </CardContent>
        </Card>

        {/* Classes Today */}
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

      {/* Today's Schedule */}
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
              <div className="w-14 h-14 mx-auto mb-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="font-medium">No Classes Today</p>
              <p className="text-sm text-muted-foreground mt-1">Enjoy your free time!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayCourses.map((course, index) => {
                const colors = [
                  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500' },
                  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-500' },
                  { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', bar: 'bg-teal-500' },
                  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-500' },
                ];
                const color = colors[index % colors.length];
                return (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className={`w-1 h-10 rounded-full ${color.bar}`} />
                    <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center`}>
                      <span className={`font-bold text-sm ${color.text}`}>{course.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{course.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{course.startTime} - {course.endTime}</span>
                        {course.location && (
                          <>
                            <span className="opacity-50">•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{course.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] rounded-md">
                      {course.credits} Cr
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Quote */}
      <DailyQuoteCard />
    </div>
  );
}

// ============ COURSES COMPONENT ============

function CoursesPage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useAppStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>('schedule');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Courses</h2>
          <p className="text-sm text-muted-foreground">Manage your course schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-xl p-1 bg-gray-50 dark:bg-gray-800">
            <Button variant={viewMode === 'schedule' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('schedule')} className="rounded-lg text-xs">
              Calendar
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-lg text-xs">
              List
            </Button>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {viewMode === 'schedule' ? (
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground w-16">Time</th>
                  {days.slice(1, 6).map((day) => (
                    <th key={day} className="p-3 text-left text-xs font-medium text-muted-foreground">{day.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b last:border-0">
                    <td className="p-2 text-xs text-muted-foreground border-r bg-gray-50/50 dark:bg-gray-800/50">{time}</td>
                    {days.slice(1, 6).map((_, dayIndex) => {
                      const course = courses.find(c => c.dayOfWeek === dayIndex + 1 && c.startTime === time);
                      return (
                        <td key={dayIndex} className="p-1">
                          {course && (
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 text-xs">
                              <p className="font-medium truncate">{course.name}</p>
                              <p className="text-[10px] text-muted-foreground">{course.location}</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{course.name}</h3>
                    <p className="text-xs text-muted-foreground">{course.code}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] rounded-lg">{course.credits} Cr</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{course.instructor}</span>
                  </div>
                  {course.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{course.location}</span>
                    </div>
                  )}
                  {course.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.startTime} - {course.endTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => setEditingCourse(course)} className="h-8 text-xs rounded-lg">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 rounded-lg" onClick={() => deleteCourse(course.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <CourseDialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)} course={editingCourse} />
    </div>
  );
}

function CourseDialog({ open, onOpenChange, course }: { open: boolean; onOpenChange: (open: boolean) => void; course?: Course | null }) {
  const { addCourse, updateCourse } = useAppStore();

  const getInitialFormData = useCallback(() => course ? {
    name: course.name,
    code: course.code,
    credits: course.credits,
    instructor: course.instructor,
    dayOfWeek: course.dayOfWeek || 1,
    startTime: course.startTime || '09:00',
    endTime: course.endTime || '10:00',
    location: course.location || '',
  } : {
    name: '',
    code: '',
    credits: 3,
    instructor: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
  }, [course]);

  const [formData, setFormData] = useState(getInitialFormData);

  // Reset form when dialog opens with new course
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(getInitialFormData());
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (course) {
      updateCourse(course.id, formData);
      toast.success('Course updated');
    } else {
      addCourse({ id: Date.now().toString(), ...formData });
      toast.success('Course added');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Course Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Code</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Credits</Label>
              <Input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} className="rounded-xl h-10" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Instructor</Label>
              <Input value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Day</Label>
              <Select value={formData.dayOfWeek.toString()} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}>
                <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                    <SelectItem key={day} value={(i + 1).toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Start Time</Label>
              <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">End Time</Label>
              <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="rounded-xl h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl">{course ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ ASSIGNMENTS COMPONENT ============

function AssignmentsPage() {
  const { assignments, updateAssignment, deleteAssignment } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed' | 'overdue'>('all');

  const filteredAssignments = assignments.filter(a => filter === 'all' || a.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Assignments</h2>
          <p className="text-sm text-muted-foreground">Track your assignments and deadlines</p>
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-32 rounded-xl h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredAssignments.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="py-8 text-center">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No assignments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${assignment.status === 'completed' ? 'bg-slate-500 border-slate-500' : 'border-gray-300'
                      }`}
                    onClick={() => updateAssignment(assignment.id, {
                      status: assignment.status === 'completed' ? 'todo' : 'completed'
                    })}
                  >
                    {assignment.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{assignment.title}</h3>
                      <Badge className={`${getStatusColor(assignment.status)} text-[10px] rounded-lg`}>
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{assignment.courseName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// ============ EXAMS COMPONENT ============

function ExamsPage() {
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

function StatisticsPage() {
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

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = completedSemesters.reduce((sum, sem) => sum + semesterData[sem as keyof typeof semesterData].credits, 0);
  const avgScore = marks.length > 0 ? (marks.reduce((sum, m) => sum + m.score, 0) / marks.length).toFixed(1) : '78.5';

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
              {typeof window !== 'undefined' && <LineChart data={gpaData} options={chartOptions} />}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              {typeof window !== 'undefined' && <Doughnut data={gradeDistribution} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ TIMETABLE PAGE ============

function TimetablePage() {
  const { user, courses, riskStudents } = useAppStore();
  const [selectedSection, setSelectedSection] = useState('CSE-A');
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [dbTimetable, setDbTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-sync to user's identity if logged in as a student
  useEffect(() => {
    if (user?.role === 'student') {
      if (user.section) setSelectedSection(user.section);
      if (user.branch) setSelectedBranch(user.branch);
    }
  }, [user]);

  // Fetch fully parsed DB timetable on load
  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/timetable');
        const data = await res.json();
        if (data.success && data.entries) {
          setDbTimetable(data.entries);
        }
      } catch (error) {
        console.error('Failed to fetch timetable:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const timeSlots = [
    { time: '07:30-08:30', label: '7:30', dbStart: '07:30' },
    { time: '08:40-09:40', label: '8:40', dbStart: '08:40' },
    { time: '09:50-10:50', label: '9:50', dbStart: '09:50' },
    { time: '11:00-12:00', label: '11:00', dbStart: '11:00' },
    { time: '12:10-13:00', label: 'LUNCH', isLunch: true },
    { time: '13:00-14:00', label: '1:00', dbStart: '13:00' },
    { time: '14:00-15:00', label: '2:00', dbStart: '14:00' },
  ];

  // Get unique sections filtering
  const branches = ['CSE', 'AI/ML', 'ECE', 'EE/EEE', 'CE', 'ME', 'DS', 'CST', 'IT'];
  const sectionsByBranch: Record<string, string[]> = {
    'CSE': ['CSE-A', 'CSE-B', 'CSE-C', 'CSE-D', 'CSE-E', 'CSE-F'],
    'AI/ML': ['AI/ML-A', 'AI/ML-B', 'AI/ML-C'],
    'ECE': ['ECE-A', 'ECE-B'],
    'EE/EEE': ['EE/EEE'],
    'CE': ['CE'],
    'ME': ['ME'],
    'DS': ['DS'],
    'CST': ['CST'],
    'IT': ['IT'],
  };

  const currentSections = sectionsByBranch[selectedBranch] || [];

  const getSubjectForSlot = (day: string, section: string, timeObj: any) => {
    if (timeObj.isLunch) return 'LUNCH';
    const entry = dbTimetable.find(e => e.dayName === day && e.section === section && e.startTime === timeObj.dbStart);
    return entry ? entry.subject : '';
  };

  const getSubjectColor = (subject: string) => {
    if (!subject) return 'bg-gray-50 dark:bg-gray-800/50';
    if (subject.includes('LAB')) return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700';
    if (subject.includes('AR CLASS')) return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    if (subject === 'LUNCH') return 'bg-gray-200 dark:bg-gray-700';
    if (['COA', 'DM', 'OS', 'JAVA', 'OB', 'CI', 'EEC', 'DM', 'DSD', 'EMT', 'PS', 'ADCT'].includes(subject)) {
      return 'bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700';
    }
    return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';
  };

  // Calculate dynamic stats
  const mondayClasses = dbTimetable.filter(e => e.dayName === 'MONDAY' && e.section === selectedSection);
  const classesToday = mondayClasses.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">
            {user?.role === 'faculty' ? 'Teaching Schedule' : 'Class Timetable'}
          </h2>
          <p className="text-sm text-muted-foreground">
            B.Tech 2024 Batch, 4th Semester (Effective from 09/02/2026)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium">Branch:</Label>
              <Select value={selectedBranch} onValueChange={(v) => {
                setSelectedBranch(v);
                setSelectedSection(sectionsByBranch[v]?.[0] || v);
              }}>
                <SelectTrigger className="w-28 rounded-xl h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium">Section:</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-28 rounded-xl h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentSections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 w-20">DAY</th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">7:30-8:30</th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">8:40-9:40</th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">9:50-10:50</th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">11:00-12:00</th>
                <th className="p-2 text-center text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-700">LUNCH<br /><span className="text-[10px] font-normal">12:10-1:00</span></th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">1:00-2:00</th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">2:00-3:00</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, dayIndex) => (
                <tr key={day} className={`${dayIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                  <td className="p-2 text-xs font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    {day}
                  </td>
                  {timeSlots.map((slot, slotIndex) => {
                    if (slot.isLunch) {
                      return (
                        <td key={slot.time} className="p-1 text-center border-r border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">LUNCH</span>
                        </td>
                      );
                    }
                    const subject = getSubjectForSlot(day, selectedSection, slot);
                    const isCurrentHour = new Date().getHours() >= parseInt(slot.label.split(':')[0]) &&
                      new Date().getHours() < parseInt(slot.label.split(':')[0]) + 1 &&
                      day === days[new Date().getDay() - 1];
                    return (
                      <td key={slot.time} className={`p-1 border-r border-gray-200 dark:border-gray-700 ${isCurrentHour ? 'bg-slate-50 dark:bg-slate-900/20' : ''}`}>
                        {subject ? (
                          <div className={`p-2 rounded-lg border text-center ${getSubjectColor(subject)}`}>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{subject}</p>
                          </div>
                        ) : (
                          <div className="p-2 text-center">
                            <span className="text-[10px] text-gray-300 dark:text-gray-600">-</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-900/30 border border-slate-300"></div>
              <span className="text-xs text-muted-foreground">Theory Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/30 border border-purple-300"></div>
              <span className="text-xs text-muted-foreground">Lab Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-300"></div>
              <span className="text-xs text-muted-foreground">AR Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs text-muted-foreground">Lunch Break</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room & Section Info */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Section Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-xs text-muted-foreground">Section</p>
              <p className="text-sm font-bold">{selectedSection}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-xs text-muted-foreground">Room No</p>
              <p className="text-sm font-bold">ATR-505</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-xs text-muted-foreground">Classes Today</p>
              <p className="text-sm font-bold text-slate-600">{classesToday}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-xs text-muted-foreground">Lab Room</p>
              <p className="text-sm font-bold">ATR-211</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ ATTENDANCE UPDATE PAGE (Faculty) ============

function AttendanceUpdatePage() {
  const { courses, dataUpdateCounter, triggerDataUpdate } = useAppStore();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  // Fetch students from database
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/users?role=student');
        const data = await res.json();
        if (data.success) {
          setStudents(data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, [dataUpdateCounter]);

  // Extract unique values for dynamic filters based on actual student data
  const availableBranches = [...new Set(students.map((s: any) => s.branch).filter(Boolean))].sort();
  const availableYears = [...new Set(students.map((s: any) => s.year).filter(Boolean))].sort((a: any, b: any) => a - b);
  const availableSections = [...new Set(students.map((s: any) => s.section).filter(Boolean))].sort();

  // Filter students based on selection
  const filteredStudents = students.filter((student: any) => {
    const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch;
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    const matchesYear = selectedYear === 'all' || student.year?.toString() === selectedYear;
    return matchesBranch && matchesSection && matchesYear;
  });

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    setAttendanceData(prev => {
      const newData = { ...prev };
      filteredStudents.forEach(s => newData[s.id] = 'present');
      return newData;
    });
    toast.success('All matching students marked as present');
  };

  const markAllAbsent = () => {
    setAttendanceData(prev => {
      const newData = { ...prev };
      filteredStudents.forEach(s => newData[s.id] = 'absent');
      return newData;
    });
    toast.success('All matching students marked as absent');
  };

  const saveAttendance = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    if (Object.keys(attendanceData).length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          attendanceData
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Attendance saved for ${selectedCourse} on ${selectedDate}`);
        setAttendanceData({});
        triggerDataUpdate();
      } else {
        toast.error(data.message || 'Failed to save attendance');
      }
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'absent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case 'late': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200';
      default: return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Update Attendance</h2>
        <p className="text-sm text-muted-foreground">Mark student attendance for classes</p>
      </div>
      {/* Selection Filters */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1.5 min-w-[200px] flex-1">
              <Label className="text-xs">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.filter(c => !['LUNCH', 'BREAK'].includes(c.name.toUpperCase())).map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="rounded-xl h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {availableBranches.map((b: any) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="rounded-xl h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((y: any) => (
                    <SelectItem key={y} value={y.toString()}>{y} Year</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="rounded-xl h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {availableSections.map((s: any) => (
                    <SelectItem key={s} value={s}>Section {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={markAllPresent} className="rounded-xl">
          <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
          Mark All Present
        </Button>
        <Button variant="outline" size="sm" onClick={markAllAbsent} className="rounded-xl">
          <X className="w-4 h-4 mr-1 text-red-500" />
          Mark All Absent
        </Button>
        <div className="flex-1" />
        <Button size="sm" onClick={saveAttendance} disabled={isSaving} className="rounded-xl">
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-md rounded-2xl bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Present</p>
            <p className="text-xl font-bold text-green-600">
              {Object.values(attendanceData).filter(s => s === 'present').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Absent</p>
            <p className="text-xl font-bold text-red-600">
              {Object.values(attendanceData).filter(s => s === 'absent').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Late</p>
            <p className="text-xl font-bold text-orange-600">
              {Object.values(attendanceData).filter(s => s === 'late').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">#</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ID</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Branch</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Year</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No students found</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-2 px-3 text-xs font-medium">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-xs">{student.collegeId}</td>
                    <td className="py-2 px-3 text-xs font-medium">{student.name}</td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="text-[10px] rounded-lg">{student.branch}</Badge>
                    </td>
                    <td className="py-2 px-3 text-xs">{student.year}</td>
                    <td className="py-2 px-3">
                      <Select
                        value={attendanceData[student.id] || ''}
                        onValueChange={(v) => handleAttendanceChange(student.id, v as 'present' | 'absent' | 'late')}
                      >
                        <SelectTrigger className={`w-24 h-8 rounded-lg text-xs ${getStatusColor(attendanceData[student.id])}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              Present
                            </div>
                          </SelectItem>
                          <SelectItem value="absent">
                            <div className="flex items-center gap-2">
                              <X className="w-3 h-3 text-red-500" />
                              Absent
                            </div>
                          </SelectItem>
                          <SelectItem value="late">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-orange-500" />
                              Late
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============ ATTENDANCE DETAIL DIALOG ============

interface AttendanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseAttendance | null;
}

interface ClassAttendanceRecord {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'P' | 'A';
  topicCovered: string;
}

function AttendanceDetailDialog({ open, onOpenChange, course }: AttendanceDetailDialogProps) {
  // Generate mock class records for the course
  const getClassRecords = (courseData: CourseAttendance): ClassAttendanceRecord[] => {
    const records: ClassAttendanceRecord[] = [];
    const topics = [
      'Introduction and basics',
      'Fundamental concepts',
      'Core principles',
      'Advanced topics',
      'Practical applications',
      'Case studies',
      'Review session',
      'Assessment',
    ];

    for (let i = 0; i < courseData.totalClasses; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (courseData.totalClasses - i - 1) * 3);

      // Randomly determine if present or absent based on attendance percentage
      const isPresent = Math.random() * 100 < courseData.percent;

      records.push({
        id: `cr-${i}`,
        date,
        startTime: i % 2 === 0 ? '09:00' : '14:00',
        endTime: i % 2 === 0 ? '10:40' : '15:40',
        status: isPresent ? 'P' : 'A',
        topicCovered: topics[i % topics.length],
      });
    }
    return records;
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

        {/* Course Summary Table */}
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

        {/* Attendance History Table */}
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

interface CourseAttendance {
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attended: number;
  percent: number;
  semester: number;
}

interface SemesterRecord {
  id: string;
  semester: number;
  sgpa: number;
  cgpa: number;
  creditsEarned: number;
  creditsTotal: number;
  academicYear: string;
}

interface SubjectMarkData {
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

interface AttendanceRecord {
  id: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attended: number;
  percentage: number;
}

function AttendanceCGPAPage() {
  const { user, dataUpdateCounter, courses } = useAppStore();
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [performanceSemester, setPerformanceSemester] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<CourseAttendance | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [semesterRecords, setSemesterRecords] = useState<SemesterRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMarkData[]>([]);
  const [stats, setStats] = useState({ currentCGPA: 0, currentSGPA: 0, overallAttendance: 0, totalCredits: 0 });

  // Fetch academic data from API
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

  // Organize attendance by semester
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

  // Get only the last 2 semesters (sorted in descending order)
  const allSemesters = Object.keys(semesterData).map(Number).sort((a, b) => b - a);
  const recentSemesters = allSemesters; // Show all semesters instead of just 2

  // Filter marks by semester for performance table (uses its own independent dropdown)
  const filteredMarks = performanceSemester === 'all'
    ? subjectMarks.filter(m => recentSemesters.includes(m.semester))
    : subjectMarks.filter(m => m.semester.toString() === performanceSemester);

  // Filter semesters based on selection (limit to 2 most recent)
  const filteredSemesters = selectedSemester === 'all'
    ? recentSemesters
    : [parseInt(selectedSemester)];

  // Filter semester records to all semesters (fix for Issue 1: Straight line trend)
  const recentSemesterRecords = semesterRecords
    .sort((a, b) => b.semester - a.semester);

  const handleCourseClick = (course: CourseAttendance) => {
    setSelectedCourse(course);
    setShowDetailDialog(true);
  };

  // CGPA chart data from semester records (limited to last 2 semesters)
  const availableSemesters = recentSemesterRecords.map(r => r.semester).sort((a, b) => a - b);
  const cgpaChartData = {
    labels: availableSemesters.map(s => `Sem ${s}`),
    datasets: [{
      label: 'SGPA',
      data: availableSemesters.map(s => {
        const record = recentSemesterRecords.find(r => r.semester === s);
        return record?.sgpa || 0;
      }),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  // Calculate overall attendance from records
  const totalClasses = attendanceRecords.reduce((sum, r) => sum + r.totalClasses, 0);
  const totalAttended = attendanceRecords.reduce((sum, r) => sum + r.attended, 0);
  const overallAttendancePercent = stats.overallAttendance || (totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0);
  const currentCGPA = stats.currentCGPA || 0;
  const totalCredits = stats.totalCredits || 0;

  // Get all available semesters for dropdown
  const availableSemesterOptions = [...new Set([...attendanceRecords.map(r => r.semester), ...recentSemesterRecords.map(r => r.semester)])].sort((a, b) => b - a);

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
            <SelectItem value="all">All Semesters</SelectItem>
            {availableSemesterOptions.map(s => (
              <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
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
            <p className="text-2xl font-bold text-purple-600">{currentCGPA}</p>
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
            <p className="text-2xl font-bold text-orange-600">{courses.reduce((sum, c) => sum + c.credits, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance by Semester */}
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
                      className={`border-b last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                        }`}
                      onClick={() => handleCourseClick(course)}
                    >
                      <td className="py-2.5 px-3 text-sm font-medium text-slate-600">{course.courseCode}</td>
                      <td className="py-2.5 px-3 text-sm">{course.courseName}</td>
                      <td className="py-2.5 px-3 text-sm text-center">{course.totalClasses}</td>
                      <td className="py-2.5 px-3 text-sm text-center">{course.attended}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge className={`text-xs rounded-lg ${course.percent >= 75
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : course.percent >= 60
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
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

      {/* CGPA Trend */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">CGPA Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            {typeof window !== 'undefined' && (
              <LineChart data={cgpaChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result Sheet Section */}
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
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">No examination results published yet.</td>
                      </tr>
                    ) : (
                      availableSemesters.map((sem, idx) => {
                        const record = recentSemesterRecords.find(r => r.semester === sem);
                        const actualSem = sem > 8 ? (sem % 2 === 0 ? 2 : 1) : sem;
                        const semString = actualSem === 1 ? '1st' : actualSem === 2 ? '2nd' : actualSem === 3 ? '3rd' : actualSem + 'th';
                        const yearApprox = record?.academicYear || '2024-25';
                        const yearBase = yearApprox.split('-')[0] || new Date().getFullYear().toString();
                        const examName = `BTech (${user?.branch || 'CSE'}) ${semString} Semester, ${yearBase}`;

                        return (
                          <tr key={sem} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => setPerformanceSemester(sem.toString())}>
                            <td className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">{idx + 1}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">{examName}</td>
                            <td className="py-3 px-4 text-center text-sm text-muted-foreground font-medium">{yearApprox}</td>
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
            const marksForSem = subjectMarks.filter(m => m.semester === sem);

            const actualSem = sem > 8 ? (sem % 2 === 0 ? 2 : 1) : sem;
            const semString = actualSem === 1 ? '1st' : actualSem === 2 ? '2nd' : actualSem === 3 ? '3rd' : actualSem + 'th';
            const yearApprox = record?.academicYear || '2024-25';
            const yearBase = yearApprox.split('-')[0] || new Date().getFullYear().toString();
            const examName = `BTech (${user?.branch || 'Computer Science and Engineering'}) ${semString} Semester, ${yearBase}`;

            return (
              <Card className="border-0 shadow-md rounded-2xl overflow-hidden min-w-full">
                <CardHeader className="pb-3 border-b bg-slate-50 dark:bg-slate-900 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Result Sheet</CardTitle>
                    <CardDescription className="text-xs mt-1">Detailed subject-wise performance</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-xl" onClick={() => setPerformanceSemester('all')}>
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to List
                  </Button>
                </CardHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 lg:p-6 border-b bg-slate-50/50 dark:bg-slate-900/20 text-sm">
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-[110px_auto] gap-2">
                      <span className="text-muted-foreground font-medium">Examination</span>
                      <span className="font-semibold">: {examName}</span>
                    </div>
                    <div className="grid grid-cols-[110px_auto] gap-2">
                      <span className="text-muted-foreground font-medium">Reg No</span>
                      <span className="font-semibold">: {user?.collegeId || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-[110px_auto] gap-2">
                      <span className="text-muted-foreground font-medium">Branch</span>
                      <span className="font-semibold">: BTech ({user?.branch || 'Computer Science and Engineering'})</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-[140px_auto] gap-2">
                      <span className="text-muted-foreground font-medium">Result Type</span>
                      <span className="font-semibold">: {semString} Semester {actualSem % 2 === 0 ? 'Even' : 'Odd'} ({yearApprox})</span>
                    </div>
                    <div className="grid grid-cols-[140px_auto] gap-2">
                      <span className="text-muted-foreground font-medium">Student Name</span>
                      <span className="font-semibold">: {user?.name || 'Student'}</span>
                    </div>
                    <div className="grid grid-cols-[140px_auto] gap-2">
                      <span className="text-muted-foreground font-medium">Published On</span>
                      <span className="font-semibold">: {new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-muted/40 border-b">
                        <tr>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-12">Sl#</th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-32 border-l border-r border-slate-200 dark:border-slate-800">Code</th>
                          <th className="py-3 px-4 text-xs font-semibold text-muted-foreground">Subject Name</th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-40 border-l border-slate-200 dark:border-slate-800 hidden sm:table-cell">Type</th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-24 border-l border-slate-200 dark:border-slate-800">Credit</th>
                          <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground w-28 border-l border-slate-200 dark:border-slate-800">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marksForSem.length > 0 ? marksForSem.map((mark, idx) => (
                          <tr key={mark.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">{idx + 1}</td>
                            <td className="py-3 px-4 text-center text-sm font-mono text-muted-foreground border-l border-r border-slate-100 dark:border-slate-800/50">{mark.subjectCode}</td>
                            <td className="py-3 px-4 text-sm font-medium capitalize tracking-tight text-slate-800 dark:text-slate-200">{mark.subjectName || '-'}</td>
                            <td className="py-3 px-4 text-center text-xs text-muted-foreground border-l border-slate-100 dark:border-slate-800/50 hidden sm:table-cell">{mark.subjectName?.toLowerCase().includes('lab') ? 'Sessional' : 'Theory & Sessional'}</td>
                            <td className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground border-l border-slate-100 dark:border-slate-800/50">{mark.credits || 4}</td>
                            <td className="py-3 px-4 text-center border-l border-slate-100 dark:border-slate-800/50">
                              <Badge variant="outline" className={`${mark.grade?.startsWith('O') || mark.grade?.startsWith('A')
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                : mark.grade?.startsWith('B')
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                  : mark.grade === 'F'
                                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                    : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                                } px-2.5 py-0.5 font-bold shadow-sm`}>
                                {mark.grade || '-'}
                              </Badge>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">No subjects found for this semester.</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 sm:hidden"></td>
                          <td colSpan={4} className="py-3 px-4 hidden sm:table-cell"></td>
                          <td className="py-3 px-4 text-center text-sm font-bold text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap">Total Credits: {record?.creditsEarned || marksForSem.reduce((s, m) => s + (m.credits || 4), 0)}</td>
                          <td className="py-3 px-4 text-center text-sm font-bold text-slate-800 dark:text-slate-100 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap">SGPA: {record?.sgpa?.toFixed(2) || '0.00'}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })()
        )}
      </div>

      {/* Attendance Detail Dialog */}
      <AttendanceDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        course={selectedCourse}
      />
    </div>
  );
}

// ============ MESSAGES COMPONENT ============

function MessagesPage() {
  const { messages, user, setMessages, addMessage } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning' | 'alert' | 'info'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'contact'>('messages');

  // Contact Teachers state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Faculty members fetched from database
  const [facultyMembers, setFacultyMembers] = useState<{ id: string; name: string; department: string; subject: string; collegeId: string }[]>([]);

  // Fetch faculty members from database
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch('/api/users?role=faculty');
        const data = await res.json();
        if (data.success && data.users) {
          setFacultyMembers(data.users.map((f: any) => ({
            id: f.id,
            collegeId: f.collegeId,
            name: f.name,
            department: f.department || 'General',
            subject: f.department || 'General',
          })));
        }
      } catch (error) {
        console.error('Failed to fetch faculty:', error);
      }
    };
    fetchFaculty();
  }, []);

  // Filter messages for the current student
  const userMessages = user?.role === 'student'
    ? messages.filter(m => m.receiverId === user.id || m.targetType === 'student' || m.targetType === 'all')
    : messages;

  const filteredMessages = userMessages.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !m.isRead;
    return m.messageType === filter;
  });

  const unreadCount = userMessages.filter(m => !m.isRead).length;

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(m =>
      m.id === messageId ? { ...m, isRead: true } : m
    ));
  };

  const markAllAsRead = () => {
    setMessages(messages.map(m => ({ ...m, isRead: true })));
    toast.success('All messages marked as read');
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

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-orange-200 dark:border-orange-800';
      case 'alert': return 'border-red-200 dark:border-red-800';
      default: return 'border-blue-200 dark:border-blue-800';
    }
  };

  // Handle send message to teacher
  const handleSendMessage = () => {
    if (!selectedTeacher || !contactSubject || !contactMessage) {
      toast.error('Please fill all fields');
      return;
    }

    const teacher = facultyMembers.find(f => f.id === selectedTeacher);

    // Add message directly to teacher's messages
    addMessage({
      id: Date.now().toString(),
      senderId: user?.id || 'student',
      senderName: user?.name || 'Student',
      receiverId: selectedTeacher,
      targetType: 'student',
      title: contactSubject,
      content: contactMessage,
      messageType: 'info',
      isRead: false,
      sentAt: new Date(),
    });

    toast.success(`Message sent to ${teacher?.name}!`);

    // Reset form
    setSelectedTeacher('');
    setContactSubject('');
    setContactMessage('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Messages</h2>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'messages'
              ? (unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!')
              : 'Send a message directly to your teachers'
            }
          </p>
        </div>
        {activeTab === 'messages' && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="rounded-xl">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'messages' | 'contact')}>
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="messages" className="rounded-lg text-sm">
            <Bell className="w-4 h-4 mr-2" />
            Messages
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-slate-600 text-white text-[10px] rounded-full h-5 w-5 p-0 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-lg text-sm">
            <Send className="w-4 h-4 mr-2" />
            Contact Teachers
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4 mt-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All', count: userMessages.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'warning', label: 'Warnings', count: userMessages.filter(m => m.messageType === 'warning').length },
              { id: 'alert', label: 'Alerts', count: userMessages.filter(m => m.messageType === 'alert').length },
              { id: 'info', label: 'Info', count: userMessages.filter(m => m.messageType === 'info').length },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={filter === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(tab.id as typeof filter)}
                className="rounded-xl whitespace-nowrap"
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-lg text-[10px]">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Messages List */}
          <div className="space-y-2">
            {filteredMessages.length === 0 ? (
              <Card className="border-0 shadow-md rounded-2xl">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="font-medium text-muted-foreground">No messages</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {filter === 'all' ? 'You have no messages yet' : `No ${filter} messages`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`border-0 shadow-md rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg ${!message.isRead ? 'bg-slate-50/50 dark:bg-slate-900/10 ring-1 ring-slate-200 dark:ring-slate-800' : ''
                    }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.isRead) markAsRead(message.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getMessageBg(message.messageType)}`}>
                        {getMessageIcon(message.messageType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{message.title}</h4>
                          {!message.isRead && (
                            <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse shrink-0" />
                          )}
                        </div>
                        {message.senderName && (
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            from {message.senderName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] rounded-lg ${getBorderColor(message.messageType)}`}
                          >
                            {message.messageType.charAt(0).toUpperCase() + message.messageType.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] rounded-lg">
                            {message.targetType === 'student' ? 'To Student' :
                              message.targetType === 'parent' ? 'To Parent' : 'To All'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(message.sentAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message Detail Dialog */}
          <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
            <DialogContent className="rounded-2xl max-w-md">
              {selectedMessage && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getMessageBg(selectedMessage.messageType)}`}>
                        {getMessageIcon(selectedMessage.messageType)}
                      </div>
                      <div>
                        <DialogTitle className="text-base">{selectedMessage.title}</DialogTitle>
                        <DialogDescription>
                          {new Date(selectedMessage.sentAt).toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`rounded-lg ${getBorderColor(selectedMessage.messageType)}`}
                      >
                        {selectedMessage.messageType.charAt(0).toUpperCase() + selectedMessage.messageType.slice(1)}
                      </Badge>
                      <Badge variant="secondary" className="rounded-lg">
                        {selectedMessage.targetType === 'student' ? 'To Student' :
                          selectedMessage.targetType === 'parent' ? 'To Parent' : 'To All'}
                      </Badge>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                    {selectedMessage.senderName && (
                      <p className="text-xs text-muted-foreground">
                        From: {selectedMessage.senderName}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setSelectedMessage(null)} className="rounded-xl">
                      Close
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Contact Teachers Tab */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Message to Teacher
              </CardTitle>
              <CardDescription>
                Select a teacher and compose your message. It will be sent directly to them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Teacher Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Teacher</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choose a teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyMembers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-slate-600 text-white text-xs">
                              {teacher.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{teacher.name}</p>
                            <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subject</Label>
                <Input
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Enter message subject..."
                  className="rounded-xl"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Message</Label>
                <Textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  className="rounded-xl resize-none"
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!selectedTeacher || !contactSubject || !contactMessage}
                className="w-full rounded-xl"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Faculty List */}
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Faculty Directory</CardTitle>
              <CardDescription>Your course instructors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {facultyMembers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveTab('contact');
                      setSelectedTeacher(teacher.id);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-slate-600 text-white">
                        {teacher.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.subject}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] rounded-lg">
                      {teacher.department}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============ SETTINGS COMPONENT ============

function SettingsPage() {
  const { theme, setTheme, exportData, importData } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleExport = async () => {
    try {
      toast.loading('Preparing database export...');
      const res = await fetch('/api/export');
      const data = await res.json();

      if (!data.success) {
        toast.error('Export failed: ' + (data.message || 'Unknown error'));
        return;
      }

      const blob = new Blob([JSON.stringify(data.exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edutrack-full-db-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Full database backup exported');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export database');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        if (importData(data)) {
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
            <div className="flex items-center border rounded-xl p-1 bg-gray-50 dark:bg-gray-800">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('light')}
                className={`rounded-lg text-xs ${theme === 'light' ? 'bg-slate-500 hover:bg-slate-600 text-white' : ''}`}
              >
                <Sun className="w-4 h-4 mr-1" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTheme('dark')}
                className={`rounded-lg text-xs ${theme === 'dark' ? 'bg-slate-500 hover:bg-slate-600 text-white' : ''}`}
              >
                <Moon className="w-4 h-4 mr-1" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium">EduTrack</p>
                <p className="text-xs text-muted-foreground">Student Affairs Management</p>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-lg">v1.0.0</Badge>
          </div>
          <div className="text-xs text-muted-foreground text-center pt-2">
            <p>© 2024 EduTrack. All rights reserved.</p>
            <p className="mt-1">Built with ❤️ for educational institutions</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 rounded-xl">
              <Mail className="w-5 h-5" />
              <span className="text-xs">Contact</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 rounded-xl">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Documentation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============

function AdminDashboard() {
  const { setActiveTab } = useAppStore();
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    faculty: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats || { total: 0, students: 0, faculty: 0, admins: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">System overview and management</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-red-600">{new Date().getDate()}</div>
          <div className="text-xs text-muted-foreground uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.students}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.faculty}</p>
            <p className="text-xs text-muted-foreground">Faculty Members</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-600">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              onClick={() => setActiveTab('import')}
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">Import Data</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
              onClick={() => setActiveTab('reports')}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">View Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="text-sm">Version</span>
            <Badge variant="secondary" className="rounded-lg">1.0.0</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="text-sm">Database Status</span>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg">Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="text-sm">Last Backup</span>
            <span className="text-sm text-muted-foreground">Never</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ ADMIN USERS PAGE ============

function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, students: 0, faculty: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleExportUsersCSV = () => {
    if (users.length === 0) {
      toast.error('No users to export');
      return;
    }

    const headers = ['ID', 'Name', 'Role', 'Email', 'Phone', 'Branch/Dept', 'Joined At'];
    const rows = users.map(u => [
      u.collegeId,
      u.name,
      u.role,
      u.email || '-',
      u.phone || '-',
      u.branch || u.department || '-',
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edutrack-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('User list exported');
  };
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { dataUpdateCounter } = useAppStore();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setStats(data.stats || { total: 0, students: 0, faculty: 0, admins: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, dataUpdateCounter]);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/users?userId=${deleteUserId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        toast.success('User deleted successfully');
        setUsers(users.filter(u => u.id !== deleteUserId));
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
      setDeleteUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.collegeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'faculty': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Users Management</h2>
          <p className="text-sm text-muted-foreground">View and manage all users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="rounded-xl">
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.students}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.faculty}</p>
            <p className="text-xs text-muted-foreground">Faculty</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportUsersCSV} className="rounded-xl h-9">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-0 shadow-md rounded-2xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white dark:bg-gray-900 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Branch/Dept</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={`text-white text-xs ${user.role === 'admin' ? 'bg-red-600' :
                                user.role === 'faculty' ? 'bg-purple-600' : 'bg-slate-600'
                                }`}>
                                {user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-sm">{user.name}</span>
                              {user.email && (
                                <p className="text-[10px] text-muted-foreground">{user.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{user.collegeId}</td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs rounded-lg ${getRoleColor(user.role)}`}>
                            {user.role || 'student'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.branch || user.department || '-'}</td>
                        <td className="py-3 px-4">
                          {user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteUserId(user.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUserId(null)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleting}
              className="rounded-xl flex-1"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN IMPORT PAGE ============

function AdminImportPage() {
  const studentCsvRef = useRef<HTMLInputElement>(null);
  const facultyCsvRef = useRef<HTMLInputElement>(null);
  const timetableRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState<'students' | 'faculty' | 'timetable'>('students');
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<'students' | 'faculty' | 'all' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({ students: 0, faculty: 0 });
  const [resetPassword, setResetPassword] = useState('');
  const [resetRole, setResetRole] = useState<'students' | 'faculty' | 'all'>('all');
  const [resetting, setResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { triggerDataUpdate } = useAppStore();

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (data.success) {
          setStats({
            students: data.stats?.students || 0,
            faculty: data.stats?.faculty || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [importing, deleting]);

  // Sample CSV templates
  const studentCsvTemplate = `collegeId,name,email,phone,branch,section,year,parentEmail,parentPhone,password
CSE001,Rahul Sharma,rahul@email.com,9876543210,CSE,A,2,parent.sharma@email.com,9876543211,rahul@2024
CSE002,Priya Singh,priya@email.com,9876543212,CSE,B,1,parent.singh@email.com,9876543213,priya@2024`;

  const facultyCsvTemplate = `collegeId,name,email,phone,department,password
T001,Dr. Rajesh Sharma,rajesh@college.edu,9876543220,Computer Science,rajesh@faculty
T002,Prof. Ananya Das,ananya@college.edu,9876543221,Mathematics,ananya@faculty`;

  const downloadTemplate = (type: 'students' | 'faculty') => {
    const template = type === 'students' ? studentCsvTemplate : facultyCsvTemplate;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const handleCsvImport = async (type: 'students' | 'faculty') => {
    const fileInput = type === 'students' ? studentCsvRef.current : facultyCsvRef.current;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target?.result as string;

        try {
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data: csvData }),
          });

          const result = await res.json();

          if (result.success) {
            toast.success(result.message);
            setImportResult(result.results);
            setShowResultDialog(true);
            triggerDataUpdate(); // Trigger global data refresh
          } else {
            toast.error(result.message || 'Import failed');
          }
        } catch (error) {
          toast.error('Failed to import CSV');
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to read file');
      setImporting(false);
    }

    // Reset file input
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTimetableImport = async () => {
    const file = timetableRef.current?.files?.[0];

    if (!file) {
      toast.error('Please select a timetable file');
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/timetable/import', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        setImportResult(result.results);
        setShowResultDialog(true);
      } else {
        toast.error(result.message || 'Import failed');
      }
    } catch (error) {
      toast.error('Failed to import timetable');
    } finally {
      setImporting(false);
      if (timetableRef.current) {
        timetableRef.current.value = '';
      }
    }
  };

  const handleDeleteAll = async (type: 'students' | 'faculty' | 'all') => {
    setDeleting(true);
    try {
      const res = await fetch('/api/users/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        setShowDeleteDialog(null);
        triggerDataUpdate(); // Trigger global data refresh
      } else {
        toast.error(result.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete data');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPasswords = async () => {
    if (!resetPassword || resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setResetting(true);
    try {
      const res = await fetch('/api/users/reset-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: resetRole, password: resetPassword }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(result.message);
        setShowResetDialog(false);
        setResetPassword('');
      } else {
        toast.error(result.message || 'Failed to reset passwords');
      }
    } catch (error) {
      toast.error('Failed to reset passwords');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Import Data</h2>
        <p className="text-sm text-muted-foreground">Bulk import students, faculty, and timetable</p>
      </div>

      {/* Import Type Tabs */}
      <Tabs value={importType} onValueChange={(v) => setImportType(v as any)}>
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="students" className="rounded-lg text-xs">Students</TabsTrigger>
          <TabsTrigger value="faculty" className="rounded-lg text-xs">Faculty</TabsTrigger>
          <TabsTrigger value="timetable" className="rounded-lg text-xs">Timetable</TabsTrigger>
        </TabsList>

        {/* Students Import */}
        <TabsContent value="students" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Import Students
              </CardTitle>
              <CardDescription>Upload student CSV to add to database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('students')}
                  className="rounded-xl flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download Template
                </Button>
                <input
                  ref={studentCsvRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={() => handleCsvImport('students')}
                />
                <Button
                  size="sm"
                  onClick={() => studentCsvRef.current?.click()}
                  disabled={importing}
                  className="rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  Import Students CSV
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Required columns:</p>
                <p><span className="text-red-500 font-medium">collegeId*</span>, <span className="text-red-500 font-medium">name*</span>, <span className="text-red-500 font-medium">password*</span>, email, phone, branch, section, year, parentEmail, parentPhone</p>
                <p className="mt-1 text-yellow-600">* Password is required for each student</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Import */}
        <TabsContent value="faculty" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Import Faculty
              </CardTitle>
              <CardDescription>Upload faculty CSV to add to database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('faculty')}
                  className="rounded-xl flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download Template
                </Button>
                <input
                  ref={facultyCsvRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={() => handleCsvImport('faculty')}
                />
                <Button
                  size="sm"
                  onClick={() => facultyCsvRef.current?.click()}
                  disabled={importing}
                  className="rounded-xl flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  Import Faculty CSV
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Required columns:</p>
                <p><span className="text-red-500 font-medium">collegeId*</span>, <span className="text-red-500 font-medium">name*</span>, <span className="text-red-500 font-medium">password*</span>, email, phone, department</p>
                <p className="mt-1 text-yellow-600">* Password is required for each faculty member</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timetable Import */}
        <TabsContent value="timetable" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Import Timetable
              </CardTitle>
              <CardDescription>Upload Excel file (.xlsx or .xls) to import timetable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  ref={timetableRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleTimetableImport}
                />
                <Button
                  size="sm"
                  onClick={() => timetableRef.current?.click()}
                  disabled={importing}
                  className="rounded-xl flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1" />
                  )}
                  Import Timetable Excel
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Expected format:</p>
                <p>The Excel file should have columns for Day, Section, and time slots (7:30-8:30, 8:40-9:40, etc.)</p>
                <p className="mt-1">Each row represents a section's schedule for a particular day.</p>
                <p className="mt-1 text-yellow-600">Note: This will replace all existing timetable entries.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Data Section */}
      <Card className="border-0 shadow-md rounded-2xl border-red-200 dark:border-red-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" />
            Delete All Data
          </CardTitle>
          <CardDescription>Remove all student or faculty records from the database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <p className="text-lg font-bold text-red-600">{stats.students}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
              <p className="text-lg font-bold text-purple-600">{stats.faculty}</p>
              <p className="text-xs text-muted-foreground">Faculty</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20 text-center">
              <p className="text-lg font-bold text-slate-600">{stats.students + stats.faculty}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog('students')}
              disabled={deleting || stats.students === 0}
              className="rounded-xl flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Students
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog('faculty')}
              disabled={deleting || stats.faculty === 0}
              className="rounded-xl flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Faculty
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog('all')}
              disabled={deleting || (stats.students === 0 && stats.faculty === 0)}
              className="rounded-xl flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete All
            </Button>
          </div>

          <p className="text-xs text-red-500 text-center">
            ⚠️ Warning: This action cannot be undone
          </p>
        </CardContent>
      </Card>

      {/* Bulk Password Reset Section */}
      <Card className="border-0 shadow-md rounded-2xl border-amber-200 dark:border-amber-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-600">
            <Key className="w-4 h-4" />
            Bulk Password Reset
          </CardTitle>
          <CardDescription>Set a new password for all students or faculty</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={resetRole === 'students' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResetRole('students')}
              className="rounded-xl"
            >
              Students ({stats.students})
            </Button>
            <Button
              variant={resetRole === 'faculty' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResetRole('faculty')}
              className="rounded-xl"
            >
              Faculty ({stats.faculty})
            </Button>
            <Button
              variant={resetRole === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResetRole('all')}
              className="rounded-xl"
            >
              All ({stats.students + stats.faculty})
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter new password (min 6 characters)"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="rounded-xl h-9 flex-1"
            />
            <Button
              size="sm"
              onClick={() => setShowResetDialog(true)}
              disabled={!resetPassword || resetPassword.length < 6 || resetting}
              className="rounded-xl bg-amber-600 hover:bg-amber-700"
            >
              <Key className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          <p className="text-xs text-amber-600 text-center">
            🔑 All selected users will be able to login with the new password
          </p>
        </CardContent>
      </Card>

      {/* Generate Sample Data Section */}
      <Card className="border-0 shadow-md rounded-2xl border-blue-200 dark:border-blue-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-600">
            <BarChart3 className="w-4 h-4" />
            Generate Sample Academic Data
          </CardTitle>
          <CardDescription>Create sample attendance and CGPA/SGPA records for students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-xs">
            <p className="font-medium text-foreground mb-1">This will generate:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li>Attendance records for current and previous semester</li>
              <li>Subject-wise marks and grades</li>
              <li>SGPA/CGPA records per semester</li>
            </ul>
            <p className="mt-2 text-blue-600">Only creates data for students without existing records</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={async () => {
                setImporting(true);
                try {
                  const res = await fetch('/api/seed-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'seed' }),
                  });
                  const result = await res.json();
                  if (result.success) {
                    toast.success(result.message);
                    triggerDataUpdate();
                  } else {
                    toast.error(result.message);
                  }
                } catch (error) {
                  toast.error('Failed to generate data');
                } finally {
                  setImporting(false);
                }
              }}
              disabled={importing || stats.students === 0}
              className="rounded-xl flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              Generate Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setImporting(true);
                try {
                  const res = await fetch('/api/seed-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cleanup' }),
                  });
                  const result = await res.json();
                  if (result.success) {
                    toast.success(result.message);
                    triggerDataUpdate();
                  } else {
                    toast.error(result.message);
                  }
                } catch (error) {
                  toast.error('Failed to cleanup data');
                } finally {
                  setImporting(false);
                }
              }}
              disabled={importing}
              className="rounded-xl flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Cleanup Old
            </Button>
          </div>

          <p className="text-xs text-blue-600 text-center">
            📊 Data is kept for maximum 2 semesters (use Cleanup to remove older data)
          </p>
        </CardContent>
      </Card>

      {/* Import Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {importResult && (
              <>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold">{importResult.success + importResult.failed}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium mb-2">Errors:</p>
                    <div className="space-y-1">
                      {importResult.errors.slice(0, 10).map((error, i) => (
                        <p key={i} className="text-xs text-red-600">{error}</p>
                      ))}
                      {importResult.errors.length > 10 && (
                        <p className="text-xs text-muted-foreground">...and {importResult.errors.length - 10} more</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              {showDeleteDialog === 'all'
                ? `This will permanently delete ALL ${stats.students + stats.faculty} records (${stats.students} students and ${stats.faculty} faculty).`
                : showDeleteDialog === 'students'
                  ? `This will permanently delete ALL ${stats.students} student records.`
                  : `This will permanently delete ALL ${stats.faculty} faculty records.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-500" />
            <p className="font-medium text-red-600">This action cannot be undone!</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteAll(showDeleteDialog!)}
              disabled={deleting}
              className="rounded-xl flex-1"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Key className="w-5 h-5" />
              Confirm Password Reset
            </DialogTitle>
            <DialogDescription>
              This will reset passwords for {resetRole === 'all'
                ? `ALL ${stats.students + stats.faculty} users`
                : resetRole === 'students'
                  ? `ALL ${stats.students} students`
                  : `ALL ${stats.faculty} faculty members`
              }.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
            <Key className="w-12 h-12 mx-auto mb-2 text-amber-500" />
            <p className="font-medium text-amber-600">New password: <code className="bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded">{resetPassword}</code></p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleResetPasswords}
              disabled={resetting}
              className="rounded-xl flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {resetting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Key className="w-4 h-4 mr-1" />
              )}
              Reset Passwords
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ FACULTY DASHBOARD ============

function FacultyDashboard() {
  const { setActiveTab, addMessage, user, dataUpdateCounter, setRiskStudents } = useAppStore();
  const [showQuickWarning, setShowQuickWarning] = useState(false);
  const [showQuickAlert, setShowQuickAlert] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [warningData, setWarningData] = useState({ studentId: '', message: '' });
  const [alertData, setAlertData] = useState({ studentId: '', message: '' });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch students from database
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=student');
      const data = await res.json();
      if (data.success) {
        const studentList = (data.users || []).map((s: any) => ({
          ...s,
          riskLevel: s.riskLevel || 'low',
          attendance: s.attendance || 0,
          cgpa: s.cgpa || 0,
          totalPoints: s.totalPoints || 0,
          riskScore: s.riskScore || 0,
        }));
        setStudents(studentList);
        setRiskStudents(studentList);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, dataUpdateCounter]);

  const highRiskCount = students.filter(s => s.riskLevel === 'high').length;
  const mediumRiskCount = students.filter(s => s.riskLevel === 'medium').length;
  const lowRiskCount = students.filter(s => s.riskLevel === 'low').length;
  const totalStudents = students.length;

  const highRiskStudents = students.filter(s => s.riskLevel === 'high');

  const handleQuickWarning = async () => {
    if (!warningData.studentId || !warningData.message) {
      toast.error('Please select a student and enter a message');
      return;
    }
    const student = students.find(s => s.id === warningData.studentId);
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: warningData.studentId,
          targetType: 'student',
          title: `Warning for ${student?.name || 'Student'}`,
          content: warningData.message,
          messageType: 'warning',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Warning sent successfully');
        setShowQuickWarning(false);
        setWarningData({ studentId: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send warning');
      }
    } catch {
      toast.error('Failed to send warning');
    }
  };

  const handleQuickAlert = async () => {
    if (!alertData.studentId || !alertData.message) {
      toast.error('Please select a student and enter a message');
      return;
    }
    const student = students.find(s => s.id === alertData.studentId);
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: alertData.studentId,
          targetType: 'parent',
          title: `Alert regarding ${student?.name || 'Student'}`,
          content: alertData.message,
          messageType: 'alert',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Parent alerted successfully');
        setShowQuickAlert(false);
        setAlertData({ studentId: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to alert parent');
      }
    } catch {
      toast.error('Failed to alert parent');
    }
  };

  const handleGenerateReport = () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const headers = ['ID', 'Name', 'Branch', 'Year', 'Section', 'Risk Level', 'Attendance %', 'CGPA'];
    const rows = students.map(s => [
      s.collegeId,
      s.name,
      s.branch || '-',
      s.year || '-',
      s.section || '-',
      s.riskLevel || 'low',
      s.attendance || '0',
      s.cgpa || '0'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-risk-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Detailed report generated');
    setShowReportDialog(false);
  };

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight">{user?.name || 'Faculty'}</h1>
          <Badge variant="secondary" className="mt-1.5 rounded-md text-xs font-medium">
            {user?.department || 'Computer Science'}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-200">{new Date().getDate()}</div>
          <div className="text-xs text-muted-foreground uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
          <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* High Risk Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-600 dark:text-red-400">High Risk</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{highRiskCount}</div>
            <div className="mt-2 h-1.5 bg-red-100 dark:bg-red-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                style={{ width: `${(highRiskCount / totalStudents) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medium Risk Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Medium Risk</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{mediumRiskCount}</div>
            <div className="mt-2 h-1.5 bg-amber-100 dark:bg-amber-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                style={{ width: `${(mediumRiskCount / totalStudents) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Low Risk Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Low Risk</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{lowRiskCount}</div>
            <div className="mt-2 h-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                style={{ width: `${(lowRiskCount / totalStudents) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Students */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Students</p>
              <p className="text-lg font-bold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Message */}
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowQuickWarning(true)}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quick Action</p>
              <p className="text-lg font-bold text-blue-600">Send Warning</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            {typeof window !== 'undefined' && (
              <Doughnut
                data={{
                  labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                  datasets: [{
                    data: [highRiskCount, mediumRiskCount, lowRiskCount],
                    backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
                    borderWidth: 0,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle' } }
                  },
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setShowQuickWarning(true)} className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600">
              <Send className="w-5 h-5" />
              <span className="text-xs font-medium">Send Warning</span>
            </Button>
            <Button variant="outline" onClick={() => setShowQuickAlert(true)} className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600">
              <Bell className="w-5 h-5" />
              <span className="text-xs font-medium">Alert Parents</span>
            </Button>
            <Button variant="outline" onClick={() => setShowReportDialog(true)} className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Generate Report</span>
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('students')} className="h-auto py-3 flex-col gap-1.5 rounded-xl hover:bg-slate-50 hover:border-slate-300">
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">View Students</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quote */}
      <DailyQuoteCard />

      {/* Quick Warning Dialog */}
      <Dialog open={showQuickWarning} onOpenChange={setShowQuickWarning}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Send Warning</DialogTitle>
            <DialogDescription>Send a warning to a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={warningData.studentId} onValueChange={(v) => setWarningData({ ...warningData, studentId: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {highRiskStudents.length > 0 ? highRiskStudents.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>
                  )) : students.slice(0, 10).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warning Message</Label>
              <Textarea
                placeholder="Enter warning message..."
                value={warningData.message}
                onChange={(e) => setWarningData({ ...warningData, message: e.target.value })}
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowQuickWarning(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleQuickWarning} className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600">Send Warning</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Alert Dialog */}
      <Dialog open={showQuickAlert} onOpenChange={setShowQuickAlert}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Alert Parent</DialogTitle>
            <DialogDescription>Send an alert to a student&apos;s parent</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={alertData.studentId} onValueChange={(v) => setAlertData({ ...alertData, studentId: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {highRiskStudents.length > 0 ? highRiskStudents.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>
                  )) : students.slice(0, 10).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message to Parent</Label>
              <Textarea
                placeholder="Enter message for parent..."
                value={alertData.message}
                onChange={(e) => setAlertData({ ...alertData, message: e.target.value })}
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowQuickAlert(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleQuickAlert} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600">Alert Parent</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>Download a risk analysis report</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Students:</span>
                <span className="font-medium">{totalStudents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>High Risk:</span>
                <span className="font-medium text-red-600">{highRiskCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium Risk:</span>
                <span className="font-medium text-orange-600">{mediumRiskCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Risk:</span>
                <span className="font-medium text-green-600">{lowRiskCount}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleGenerateReport} className="flex-1 rounded-xl">Download Report</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ STUDENTS PAGE (Faculty) ============

function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const itemsPerPage = 50;
  const { dataUpdateCounter } = useAppStore();

  // Fetch students from API
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=student');
      const data = await res.json();
      if (data.success) {
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No student data to export');
      return;
    }

    const headers = ['ID', 'Name', 'Branch', 'Section', 'Year', 'Attendance %', 'CGPA'];
    const rows = students.map(s => [
      s.collegeId,
      s.name,
      s.branch || '-',
      s.section || '-',
      s.year || '-',
      s.attendance || '0',
      s.cgpa || '0'
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edutrack-students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Student list exported');
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, dataUpdateCounter]);

  // Get unique branches from students
  const branches = [...new Set(students.map((s: any) => s.branch).filter(Boolean))];
  const years = [...new Set(students.map((s: any) => s.year).filter(Boolean))];

  const filteredStudents = students.filter((student: any) => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.collegeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'all' || student.branch === branchFilter;
    const matchesYear = yearFilter === 'all' || student.year?.toString() === yearFilter;
    const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
    return matchesSearch && matchesBranch && matchesYear && matchesSection;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Students</h2>
              <p className="text-sm text-muted-foreground">View and manage student data</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-lg">
                {students.length} Total Students
              </Badge>
              <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loading} className="rounded-xl h-8">
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl h-8">
                <Download className="w-3.5 h-3.5 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <Card className="border-0 shadow-sm rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 rounded-xl h-9"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2">
                  {/* Branch Filter */}
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-36 rounded-xl h-9">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((b: string) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Year Filter */}
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-28 rounded-xl h-9">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.sort().map((y: number) => (
                        <SelectItem key={y} value={y.toString()}>{y} Year</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Section Filter */}
                  <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="w-28 rounded-xl h-9">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                      <SelectItem value="D">Section D</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {(branchFilter !== 'all' || yearFilter !== 'all' || sectionFilter !== 'all' || searchTerm) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBranchFilter('all');
                        setYearFilter('all');
                        setSectionFilter('all');
                        setSearchTerm('');
                      }}
                      className="h-9 rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{paginatedStudents.length}</span> of {filteredStudents.length} students
          </p>
        </div>

        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Branch</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Year</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Section</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No students found matching your filters</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student: any, idx: number) => (
                      <tr
                        key={student.id}
                        className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/10 cursor-pointer transition-colors"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="py-2 px-3 text-xs text-muted-foreground">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td className="py-2 px-3 font-mono text-xs">{student.collegeId}</td>
                        <td className="py-2 px-3 text-sm font-medium">{student.name}</td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{student.email || '-'}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className="text-[10px] rounded-lg">
                            {student.branch || '-'}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-xs">{student.year || '-'}</td>
                        <td className="py-2 px-3 text-xs">{student.section || '-'}</td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{student.phone || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Click on a row to view student details
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg h-8"
              >
                Prev
              </Button>
              <span className="text-xs px-2">{currentPage}/{totalPages || 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-slate-500 text-white">
                    {selectedStudent.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStudent.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedStudent.collegeId}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{selectedStudent.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{selectedStudent.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p>{selectedStudent.branch || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Section</p>
                  <p>{selectedStudent.section || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p>{selectedStudent.year || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parent Email</p>
                  <p>{selectedStudent.parentEmail || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Parent Phone</p>
                  <p>{selectedStudent.parentPhone || '-'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedStudent(null)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ RISK ANALYSIS PAGE (Faculty) ============

function RiskAnalysisPage() {
  const { riskStudents } = useAppStore();
  const [selectedStudent, setSelectedStudent] = useState<StudentRiskInfo | null>(null);
  const highRiskStudents = riskStudents.filter(s => s.riskLevel === 'high');
  const mediumRiskStudents = riskStudents.filter(s => s.riskLevel === 'medium');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Risk Analysis</h2>
          <p className="text-sm text-muted-foreground">Identify at-risk students • Click on a card to view details</p>
        </div>

        {/* High Risk Students */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              High Risk Students ({highRiskStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highRiskStudents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500 opacity-30" />
                <p className="text-sm">No high-risk students</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {highRiskStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="border-2 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-red-500 text-white text-xs">
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground">{student.collegeId}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-500 text-[10px] rounded-lg">High</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-center mt-2">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-1">
                          <div className="font-semibold text-blue-700">{(student as any).attPoints ?? 0}</div>
                          <div className="text-muted-foreground">Att</div>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-1">
                          <div className="font-semibold text-purple-700">{(student as any).cgpaPoints ?? 0}</div>
                          <div className="text-muted-foreground">CGPA</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 rounded p-1">
                          <div className="font-semibold text-green-700">{(student as any).consistencyPoints ?? 0}</div>
                          <div className="text-muted-foreground">Cons</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span>Score {(student as any).totalPoints ?? 0}/130</span>
                          <span className="font-medium text-red-600">{student.riskScore.toFixed(0)}%</span>
                        </div>
                        <Progress value={student.riskScore} className="h-1 bg-red-100" />
                      </div>
                      <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900">
                        <p className="text-[10px] text-muted-foreground text-center">Click to view details &amp; send warning</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medium Risk Students */}
        {mediumRiskStudents.length > 0 && (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Medium Risk Students ({mediumRiskStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mediumRiskStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="border border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="bg-orange-500 text-white text-xs">
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground">{student.collegeId}</p>
                          </div>
                        </div>
                        <Badge className={`${getRiskColor(student.riskLevel)} text-[10px] rounded-lg`}>Medium</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-center mt-2">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-1">
                          <div className="font-semibold text-blue-700">{(student as any).attPoints ?? 0}</div>
                          <div className="text-muted-foreground">Att</div>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-1">
                          <div className="font-semibold text-purple-700">{(student as any).cgpaPoints ?? 0}</div>
                          <div className="text-muted-foreground">CGPA</div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 rounded p-1">
                          <div className="font-semibold text-green-700">{(student as any).consistencyPoints ?? 0}</div>
                          <div className="text-muted-foreground">Cons</div>
                        </div>
                      </div>
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span>Score {(student as any).totalPoints ?? 0}/130</span>
                          <span className="font-medium text-orange-600">{student.riskScore.toFixed(0)}%</span>
                        </div>
                        <Progress value={student.riskScore} className="h-1 bg-orange-100" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <StudentDetailsDialog
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
        student={selectedStudent}
      />
    </>
  );
}

// ============ MESSAGING PAGE (Faculty) ============

function MessagingPage() {
  const { messages, addMessage, user } = useAppStore();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [composeData, setComposeData] = useState({
    title: '',
    content: '',
    targetType: 'student' as 'student' | 'parent' | 'all',
    messageType: 'warning' as 'warning' | 'alert' | 'info',
    selectedStudentId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students from database
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/users?role=student');
        const data = await res.json();
        if (data.success && data.users) {
          setStudents(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: composeData.selectedStudentId === 'all' ? undefined : composeData.selectedStudentId,
          targetType: composeData.targetType,
          title: composeData.title,
          content: composeData.content,
          messageType: composeData.messageType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Message sent');
        setIsComposeOpen(false);
        setComposeData({ title: '', content: '', targetType: 'student', messageType: 'warning', selectedStudentId: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Messaging</h2>
          <p className="text-sm text-muted-foreground">Send warnings and alerts to students</p>
        </div>
        <Button size="sm" onClick={() => setIsComposeOpen(true)} className="rounded-xl">
          <Send className="w-4 h-4 mr-1" />
          Compose
        </Button>
      </div>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages sent yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${message.messageType === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    message.messageType === 'alert' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                    {message.messageType === 'warning' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
                      message.messageType === 'alert' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                        <Bell className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{message.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{message.content}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] rounded-lg shrink-0">{message.targetType}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>Send a message to a specific student or all students</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Select Student</Label>
              <Select value={composeData.selectedStudentId} onValueChange={(v) => setComposeData({ ...composeData, selectedStudentId: v })}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="Select a student (or leave empty for all)" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search Roll No or Name..."
                      className="h-8 text-xs rounded-lg mb-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <SelectItem value="all">All Students</SelectItem>
                  {students
                    .filter(s =>
                      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.collegeId.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.collegeId}){student.branch ? ` - ${student.branch}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Title</Label>
              <Input value={composeData.title} onChange={(e) => setComposeData({ ...composeData, title: e.target.value })} required className="rounded-xl h-10" placeholder="Enter message title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Target</Label>
                <Select value={composeData.targetType} onValueChange={(v: any) => setComposeData({ ...composeData, targetType: v })}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={composeData.messageType} onValueChange={(v: any) => setComposeData({ ...composeData, messageType: v })}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Message</Label>
              <Textarea value={composeData.content} onChange={(e) => setComposeData({ ...composeData, content: e.target.value })} rows={3} required className="rounded-xl" placeholder="Enter your message..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl">Send</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ REPORTS PAGE (Faculty) ============

function ReportsPage() {
  const { riskStudents, user } = useAppStore();

  const handleExportRiskReport = () => {
    const highRisk = riskStudents.filter(s => s.riskLevel === 'high');
    if (highRisk.length === 0) {
      toast.error('No high-risk students to report');
      return;
    }
    const headers = ['ID', 'Name', 'Branch', 'Risk Score', 'Attendance', 'CGPA'];
    const rows = highRisk.map(s => [
      s.collegeId, s.name, s.branch || '-', `${s.riskScore}%`, `${s.attendance}%`, s.cgpa.toString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `high-risk-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Risk Report exported');
  };

  const handleExportAnalytics = () => {
    if (riskStudents.length === 0) {
      toast.error('No analytics data available');
      return;
    }
    const total = riskStudents.length;
    const high = riskStudents.filter(s => s.riskLevel === 'high').length;
    const medium = riskStudents.filter(s => s.riskLevel === 'medium').length;
    const low = riskStudents.filter(s => s.riskLevel === 'low').length;
    const avgAtt = (riskStudents.reduce((sum, s) => sum + s.attendance, 0) / total).toFixed(1);
    const avgCgpa = (riskStudents.reduce((sum, s) => sum + s.cgpa, 0) / total).toFixed(2);

    const content = `EduTrack Analytics Report
Date: ${new Date().toLocaleDateString()}
-------------------------
Total Students: ${total}

Risk Distribution:
- High Risk: ${high} (${((high/total)*100).toFixed(1)}%)
- Medium Risk: ${medium} (${((medium/total)*100).toFixed(1)}%)
- Low Risk: ${low} (${((low/total)*100).toFixed(1)}%)

Academic Averages:
- Average Attendance: ${avgAtt}%
- Average CGPA: ${avgCgpa}
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-summary-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported');
  };


  const handleExportFullJSON = async () => {
    try {
      toast.loading('Preparing full database export...');
      const res = await fetch('/api/export');
      const data = await res.json();

      if (!data.success) {
        toast.error('Export failed');
        return;
      }

      const blob = new Blob([JSON.stringify(data.exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edutrack-full-dataset-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Full dataset exported');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleExportCSV = () => {
    if (riskStudents.length === 0) {
      toast.error('No student data to export');
      return;
    }

    const headers = ['ID', 'Name', 'Branch', 'Section', 'Year', 'Attendance', 'CGPA', 'Total Points', 'Risk Level'];
    const rows = riskStudents.map(s => [
      s.collegeId,
      s.name,
      s.branch || '-',
      s.section || '-',
      s.year || '-',
      s.attendance || '0',
      s.cgpa || '0',
      s.totalPoints || '0',
      s.riskLevel || 'low'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edutrack-student-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV report exported');
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Reports</h2>
        <p className="text-sm text-muted-foreground">Generate and export reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {user?.role !== 'admin' && (
          <Card className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExportCSV}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Student CSV</h3>
                  <p className="text-xs text-muted-foreground">Export as spreadsheet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExportFullJSON}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Full Dataset JSON</h3>
                <p className="text-xs text-muted-foreground">Complete database dump</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role !== 'admin' && (
          <>
            <Card className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExportRiskReport}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Risk Report</h3>
                    <p className="text-xs text-muted-foreground">High-risk students only</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExportAnalytics}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Analytics</h3>
                    <p className="text-xs text-muted-foreground">Statistics summary text</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {user?.role !== 'admin' && (
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{riskStudents.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{riskStudents.filter(s => s.riskLevel === 'high').length}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(riskStudents.reduce((sum, s) => sum + s.attendance, 0) / (riskStudents.length || 1)).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Att</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(riskStudents.reduce((sum, s) => sum + s.cgpa, 0) / (riskStudents.length || 1)).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Avg CGPA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============ MAIN APP COMPONENT ============

function MainApp() {
  const { user, activeTab, sidebarCollapsed, setCourses, setRiskStudents, dataUpdateCounter } = useAppStore();

  // Global Data Synchronization
  useEffect(() => {
    const syncGlobalData = async () => {
      // 1. Always sync timetable to store for quick access
      try {
        const res = await fetch('/api/timetable');
        const data = await res.json();
        if (data.success && data.entries) {
          const mappedCourses = data.entries.map((e: any) => ({
            id: e.id,
            name: e.subject,
            code: e.subject, // Using subject as code if not present
            credits: 3,
            instructor: 'Faculty',
            dayOfWeek: e.dayOfWeek,
            startTime: e.startTime,
            endTime: e.endTime,
            location: e.location || 'TBA',
            section: e.section
          }));
          setCourses(mappedCourses);
        }
      } catch (err) { console.error('Timetable sync failed', err); }

      // 2. If Faculty/Admin, sync student list
      if (user?.role !== 'student') {
        try {
          const res = await fetch('/api/users?role=student');
          const data = await res.json();
          if (data.success && data.users) {
            const mappedStudents = data.users.map((s: any) => ({
              ...s,
              riskLevel: s.riskLevel || 'low',
              riskScore: s.riskScore || 0,
              attendance: s.attendance || 0,
              cgpa: s.cgpa || 0,
              totalPoints: s.totalPoints || 0
            }));
            setRiskStudents(mappedStudents);
          }
        } catch (err) { console.error('Student sync failed', err); }
      }
    };

    syncGlobalData();
  }, [user?.role, setCourses, setRiskStudents, dataUpdateCounter]);

  const renderContent = () => {
    if (user?.role === 'student') {
      switch (activeTab) {
        case 'dashboard': return <StudentDashboard />;
        case 'timetable': return <TimetablePage />;
        case 'points': return <PointsPage />;
        case 'attendance-cgpa': return <AttendanceCGPAPage />;
        case 'exams': return <ExamsPage />;
        case 'messages': return <MessagesPage />;
        case 'settings': return <SettingsPage />;
        default: return <StudentDashboard />;
      }
    } else if (user?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'users': return <AdminUsersPage />;
        case 'import': return <AdminImportPage />;
        case 'reports': return <ReportsPage />;
        case 'settings': return <SettingsPage />;
        default: return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <FacultyDashboard />;
        case 'students': return <StudentsPage />;
        case 'attendance': return <AttendanceUpdatePage />;
        case 'risk-analysis': return <RiskAnalysisPage />;
        case 'messaging': return <MessagingPage />;
        case 'reports': return <ReportsPage />;
        case 'settings': return <SettingsPage />;
        default: return <FacultyDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className={`pt-16 pb-20 lg:pb-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
        }`}>
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

// ============ ROOT PAGE ============

export default function Page() {
  const { user, setUser, setCourses, setAssignments, setExams, setMarks, setAttendance, setPoints, theme } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme on initial load
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const initDemoData = () => {
      const demoCourses: Course[] = [
        { id: '1', name: 'Data Structures', code: 'CS201', credits: 4, instructor: 'Dr. Rajesh Sharma', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', location: 'Room 101' },
        { id: '2', name: 'Database Systems', code: 'CS301', credits: 3, instructor: 'Prof. Ananya Das', dayOfWeek: 2, startTime: '10:00', endTime: '11:00', location: 'Room 202' },
        { id: '3', name: 'Operating Systems', code: 'CS401', credits: 4, instructor: 'Dr. Vikram Patel', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', location: 'Room 103' },
        { id: '4', name: 'Computer Networks', code: 'CS501', credits: 3, instructor: 'Prof. Sneha Roy', dayOfWeek: 4, startTime: '14:00', endTime: '15:00', location: 'Room 304' },
        { id: '5', name: 'Machine Learning', code: 'CS601', credits: 4, instructor: 'Dr. Amit Verma', dayOfWeek: 5, startTime: '11:00', endTime: '12:00', location: 'Room 405' },
      ];

      const demoAssignments: Assignment[] = [
        { id: '1', courseId: '1', courseName: 'Data Structures', title: 'Binary Tree Implementation', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'todo' },
        { id: '2', courseId: '2', courseName: 'Database Systems', title: 'ER Diagram Design', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'in_progress' },
        { id: '3', courseId: '3', courseName: 'Operating Systems', title: 'Process Scheduling Report', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'overdue' },
      ];

      const demoExams: Exam[] = [
        { id: '1', courseId: '1', courseName: 'Data Structures', title: 'Midterm Exam', examDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), duration: 120, location: 'Hall A', examType: 'midterm' },
        { id: '2', courseId: '2', courseName: 'Database Systems', title: 'Final Exam', examDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), duration: 180, location: 'Hall B', examType: 'final' },
      ];

      const demoMarks: Mark[] = [
        { id: '1', courseId: '1', courseName: 'Data Structures', semester: 3, score: 85, grade: 'A', gradePoints: 9 },
        { id: '2', courseId: '2', courseName: 'Database Systems', semester: 3, score: 78, grade: 'B', gradePoints: 8 },
        { id: '3', courseId: '3', courseName: 'Operating Systems', semester: 4, score: 82, grade: 'A', gradePoints: 9 },
      ];

      const demoAttendance = Array.from({ length: 30 }, (_, i) => ({
        id: `a${i}`,
        subject: ['DS', 'DBMS', 'OS', 'CN', 'ML'][i % 5],
        status: (Math.random() > 0.2 ? 'present' : 'absent') as 'present' | 'absent',
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      }));

      setCourses(demoCourses);
      setAssignments(demoAssignments);
      setExams(demoExams);
      setMarks(demoMarks);
      setAttendance(demoAttendance);
      setPoints({ totalPoints: 95, socialPoints: 25, academicPoints: 70 });
      setIsLoading(false);
    };

    initDemoData();
  }, [setCourses, setAssignments, setExams, setMarks, setAttendance, setPoints]);

  const handleLogin = (loggedInUser: User) => {
    const userWithLoginTime = {
      ...loggedInUser,
      loginTime: new Date().toISOString()
    };
    setUser(userWithLoginTime);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-white font-medium">Loading EduTrack...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <MainApp />;
}
