'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Search, 
  X, 
  MessageSquare, 
  Send, 
  Users, 
  FileText, 
  GraduationCap, 
  BarChart3, 
  Database, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Check, 
  ChevronLeft, 
  UserPlus,
  Bell
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getInitial, getRoleColor } from '@/lib/utils';
import { DailyQuoteCard } from '@/components/features/FeaturesComponents';
import { toast } from 'sonner';

// ============ INTERFACES ============

interface StudentRiskInfo {
  id: string;
  collegeId: string;
  name: string;
  branch: string;
  section: string;
  attendance: number;
  cgpa: number;
  totalPoints: number;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
}

// ============ ATTENDANCE UPDATE COMPONENT ============

export function AttendanceUpdatePage() {
  const { user, triggerDataUpdate } = useAppStore();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [topicCovered, setTopicCovered] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchTimetableData = async () => {
      try {
        const res = await fetch('/api/timetable');
        const data = await res.json();
        if (data.success && data.summaries) {
           setAvailableSections(data.summaries.map((s: any) => s.section));
           const subjects = [...new Set(data.timetable?.map((t: any) => t.subject).filter(Boolean) as string[])];
           setAvailableSubjects(subjects.filter(s => !s.toLowerCase().includes('break') && !s.toLowerCase().includes('lunch')));
        }
      } catch (e) { console.error(e); }
    };
    fetchTimetableData();
  }, []);

  const fetchStudents = async () => {
    if (!selectedSection) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users?role=student&section=${selectedSection}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.users || []);
        const initialAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
        data.users.forEach((s: any) => { initialAttendance[s.id] = 'present'; });
        setAttendance(initialAttendance);
      }
    } catch (e) { toast.error('Failed to fetch students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [selectedSection]);

  const handleUpdate = async () => {
    if (!selectedSubject || !date) { toast.error('Please select subject and date'); return; }
    setSubmitting(true);
    try {
      const logs = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        date,
        subject: selectedSubject,
        status,
        topicCovered
      }));

      const res = await fetch('/api/attendance-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, facultyId: user?.id })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(`Attendance updated for ${data.count} students`);
        triggerDataUpdate();
        setTopicCovered('');
      } else { toast.error(data.message || 'Failed to update'); }
    } catch { toast.error('Update failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div><h2 className="text-xl font-bold">Mark Attendance</h2><p className="text-sm text-muted-foreground">Select section and subject to mark daily attendance</p></div>
        <div className="flex gap-2"><Input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-[150px] rounded-xl h-9" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="space-y-2">
           <Label className="text-xs">Section</Label>
           <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Choose Section" /></SelectTrigger>
              <SelectContent>{availableSections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
           </Select>
        </div>
        <div className="space-y-2">
           <Label className="text-xs">Subject</Label>
           <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Choose Subject" /></SelectTrigger>
              <SelectContent>{availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
           </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Topic Covered (Optional)</Label>
        <Input value={topicCovered} onChange={e=>setTopicCovered(e.target.value)} placeholder="e.g. Graph Algorithms" className="rounded-xl h-10" />
      </div>

      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="p-12 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div> : 
           <table className="w-full text-sm">
             <thead className="bg-gray-50 border-b">
               <tr>
                 <th className="p-3 text-left">Roll No</th>
                 <th className="p-3 text-left">Name</th>
                 <th className="p-3 text-center">Status</th>
               </tr>
             </thead>
             <tbody>
               {students.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Select a section to load students</td></tr> : 
                 students.map(s => (
                   <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                     <td className="p-3 font-mono text-xs">{s.collegeId}</td>
                     <td className="p-3 font-medium">{s.name}</td>
                     <td className="p-3 flex items-center justify-center gap-1.5">
                       {['present', 'absent', 'late'].map(st => (
                         <Button key={st} size="sm" variant={attendance[s.id] === st ? 'default' : 'outline'} onClick={() => setAttendance({...attendance, [s.id]: st as any})} className={`h-8 rounded-lg text-xs capitalize ${attendance[s.id]===st ? (st==='present' ? 'bg-green-600' : st==='absent' ? 'bg-red-600' : 'bg-orange-600') : ''}`}>
                            {st[0].toUpperCase()}
                         </Button>
                       ))}
                     </td>
                   </tr>
                 ))
               }
             </tbody>
           </table>
          }
        </div>
      </Card>
      
      {students.length > 0 && (
         <Button onClick={handleUpdate} disabled={submitting} className="w-full rounded-xl h-11 bg-slate-700 hover:bg-slate-800 text-white">
            {submitting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Submit Attendance
         </Button>
      )}
    </div>
  );
}

// ============ FACULTY DASHBOARD ============

export function FacultyDashboard() {
  const { setActiveTab, addMessage, user, dataUpdateCounter, setRiskStudents } = useAppStore();
  const [showQuickWarning, setShowQuickWarning] = useState(false);
  const [showQuickAlert, setShowQuickAlert] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [warningData, setWarningData] = useState({ studentId: '', message: '' });
  const [alertData, setAlertData] = useState({ studentId: '', message: '' });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [setRiskStudents]);

  useEffect(() => { fetchStudents(); }, [fetchStudents, dataUpdateCounter]);

  const highRiskStudents = students.filter(s => s.riskLevel === 'high');
  const totalStudents = students.length;

  const handleQuickWarning = async () => {
    if (!warningData.studentId || !warningData.message) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: warningData.studentId,
          targetType: 'student',
          title: `Warning`,
          content: warningData.message,
          messageType: 'warning',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message); toast.success('Warning sent');
        setShowQuickWarning(false); setWarningData({ studentId: '', message: '' });
      }
    } catch { toast.error('Failed'); }
  };

  const handleQuickAlert = async () => {
    if (!alertData.studentId || !alertData.message) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id,
          receiverId: alertData.studentId,
          targetType: 'parent',
          title: `Alert`,
          content: alertData.message,
          messageType: 'alert',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message); toast.success('Parent alerted');
        setShowQuickAlert(false); setAlertData({ studentId: '', message: '' });
      }
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
           <p className="text-xs text-muted-foreground uppercase tracking-wider">Academic Overview</p>
           <h1 className="text-2xl font-bold">{user?.name || 'Faculty'}</h1>
           <Badge variant="secondary" className="mt-1">{user?.department}</Badge>
        </div>
        <div className="text-right">
           <div className="text-2xl font-bold">{new Date().getDate()}</div>
           <div className="text-xs text-muted-foreground uppercase">{new Date().toLocaleDateString('en-US', {month:'short', year:'numeric'})}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
         <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-100">
            <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-red-600">High Risk</span><AlertTriangle className="w-4 h-4 text-red-500"/></div>
            <div className="text-2xl font-bold text-red-700">{students.filter(s=>s.riskLevel==='high').length}</div>
            <Progress value={(students.filter(s=>s.riskLevel==='high').length/totalStudents)*100} className="h-1 bg-red-100 mt-2" />
         </Card>
         <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-100">
            <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-orange-600">Medium Risk</span><AlertCircle className="w-4 h-4 text-orange-500"/></div>
            <div className="text-2xl font-bold text-orange-700">{students.filter(s=>s.riskLevel==='medium').length}</div>
            <Progress value={(students.filter(s=>s.riskLevel==='medium').length/totalStudents)*100} className="h-1 bg-orange-100 mt-2" />
         </Card>
         <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100">
            <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-emerald-600">Safe</span><CheckCircle className="w-4 h-4 text-emerald-500"/></div>
            <div className="text-2xl font-bold text-emerald-700">{students.filter(s=>s.riskLevel==='low').length}</div>
            <Progress value={(students.filter(s=>s.riskLevel==='low').length/totalStudents)*100} className="h-1 bg-emerald-100 mt-2" />
         </Card>
      </div>

      <DailyQuoteCard />

      <div className="grid grid-cols-2 gap-3">
         <Button onClick={()=>setShowQuickWarning(true)} className="rounded-xl h-12 bg-orange-500 hover:bg-orange-600 text-white"><AlertTriangle className="w-4 h-4 mr-2" /> Send Warning</Button>
         <Button onClick={()=>setShowQuickAlert(true)} className="rounded-xl h-12 bg-red-500 hover:bg-red-600 text-white"><AlertCircle className="w-4 h-4 mr-2" /> Alert Parent</Button>
      </div>

      <Dialog open={showQuickWarning} onOpenChange={setShowQuickWarning}>
         <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Quick Warning</DialogTitle></DialogHeader>
            <div className="space-y-4">
               <Select value={warningData.studentId} onValueChange={v=>setWarningData({...warningData, studentId:v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose Student" /></SelectTrigger>
                  <SelectContent>{highRiskStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>)}</SelectContent>
               </Select>
               <Textarea value={warningData.message} onChange={e=>setWarningData({...warningData, message:e.target.value})} placeholder="Warning message..." className="rounded-xl" />
               <Button onClick={handleQuickWarning} className="w-full rounded-xl">Send Warning</Button>
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={showQuickAlert} onOpenChange={setShowQuickAlert}>
         <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Alert Parent</DialogTitle></DialogHeader>
            <div className="space-y-4">
               <Select value={alertData.studentId} onValueChange={v=>setAlertData({...alertData, studentId:v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose Student" /></SelectTrigger>
                  <SelectContent>{highRiskStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>)}</SelectContent>
               </Select>
               <Textarea value={alertData.message} onChange={e=>setAlertData({...alertData, message:e.target.value})} placeholder="Alert message..." className="rounded-xl" />
               <Button onClick={handleQuickAlert} className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white">Alert Parent</Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ STUDENTS PAGE (Faculty) ============

export function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const { dataUpdateCounter } = useAppStore();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=student');
      const data = await res.json();
      if (data.success) { setStudents(data.users || []); }
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents, dataUpdateCounter]);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.collegeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold">Students Directory</h2>
         <Badge variant="outline" className="rounded-lg">{filtered.length} Students</Badge>
      </div>

      <div className="relative">
         <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
         <Input placeholder="Search students..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-9 rounded-xl h-10" />
      </div>

      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-sm">
               <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Branch</th><th className="p-3 text-center">Year</th></tr>
               </thead>
               <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={()=>setSelectedStudent(s)}>
                       <td className="p-3 font-mono text-xs">{s.collegeId}</td>
                       <td className="p-3 font-medium">{s.name}</td>
                       <td className="p-3"><Badge variant="outline" className="rounded-lg text-[10px]">{s.branch}</Badge></td>
                       <td className="p-3 text-center">{s.year}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      <Dialog open={!!selectedStudent} onOpenChange={o=>!o&&setSelectedStudent(null)}>
         <DialogContent className="rounded-2xl max-w-md">
            {selectedStudent && (
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <Avatar className="w-12 h-12"><AvatarFallback>{getInitial(selectedStudent.name)}</AvatarFallback></Avatar>
                     <div><p className="font-bold">{selectedStudent.name}</p><p className="text-xs text-muted-foreground">{selectedStudent.collegeId}</p></div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                     <div><p className="text-xs text-muted-foreground">Email</p><p>{selectedStudent.email || '-'}</p></div>
                     <div><p className="text-xs text-muted-foreground">Phone</p><p>{selectedStudent.phone || '-'}</p></div>
                     <div><p className="text-xs text-muted-foreground">Branch</p><p>{selectedStudent.branch}</p></div>
                     <div><p className="text-xs text-muted-foreground">Section</p><p>{selectedStudent.section}</p></div>
                  </div>
               </div>
            )}
            <DialogFooter><Button onClick={()=>setSelectedStudent(null)} className="rounded-xl">Close</Button></DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ RISK ANALYSIS PAGE (Faculty) ============

export function RiskAnalysisPage() {
  const { riskStudents } = useAppStore();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Academic Risk Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
         {riskStudents.filter(s => s.riskLevel !== 'low').map(s => (
           <Card key={s.id} className={`border p-4 rounded-2xl cursor-pointer hover:shadow-md transition-shadow ${s.riskLevel==='high'?'border-red-200 bg-red-50/30':'border-orange-200 bg-orange-50/30'}`} onClick={()=>setSelectedStudent(s)}>
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback>{getInitial(s.name)}</AvatarFallback></Avatar>
                    <div><p className="text-sm font-bold">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.collegeId}</p></div>
                 </div>
                 <Badge className={`capitalize text-[10px] rounded-lg ${s.riskLevel==='high'?'bg-red-500':'bg-orange-500'}`}>{s.riskLevel}</Badge>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-xs"><span>Overall Score</span><span className="font-bold">{s.riskScore.toFixed(0)}%</span></div>
                 <Progress value={s.riskScore} className={`h-1.5 ${s.riskLevel==='high'?'bg-red-100':'bg-orange-100'}`} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-center">
                 <div className="p-1 rounded bg-background border"><div>{s.attendance}%</div><div className="text-muted-foreground">Attendance</div></div>
                 <div className="p-1 rounded bg-background border"><div>{s.cgpa}</div><div className="text-muted-foreground">CGPA</div></div>
              </div>
           </Card>
         ))}
      </div>
      
      {/* Risk Dialog reuse students dialog but with more info if needed */}
    </div>
  );
}

// ============ MESSAGING PAGE (Faculty) ============

export function MessagingPage() {
  const { messages, addMessage, user } = useAppStore();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [composeData, setComposeData] = useState({
    title: '', content: '', targetType: 'student' as any, messageType: 'warning' as any, selectedStudentId: ''
  });

  useEffect(() => {
    fetch('/api/users?role=student').then(r=>r.json()).then(d=>d.success && setStudents(d.users));
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: user?.id,
        receiverId: composeData.selectedStudentId === 'all' ? undefined : composeData.selectedStudentId,
        targetType: composeData.targetType,
        title: composeData.title,
        content: composeData.content,
        messageType: composeData.messageType,
      })
    });
    const d = await res.json();
    if(d.success) { addMessage(d.message); setIsComposeOpen(false); toast.success('Sent'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold">Announcements</h2>
         <Button size="sm" onClick={()=>setIsComposeOpen(true)} className="rounded-xl"><Send className="w-4 h-4 mr-2" /> Compose</Button>
      </div>

      <div className="space-y-2">
         {messages.slice().reverse().map(m => (
           <Card key={m.id} className="p-4 flex gap-3 items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.messageType==='warning'?'bg-orange-100':'bg-blue-100'}`}>
                 {m.messageType==='warning' ? <AlertTriangle className="w-5 h-5 text-orange-600"/> : <Bell className="w-5 h-5 text-blue-600"/>}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold">{m.title}</p>
                 <p className="text-xs text-muted-foreground line-clamp-1">{m.content}</p>
              </div>
              <Badge variant="outline" className="text-[10px] rounded-lg">{m.messageType}</Badge>
           </Card>
         ))}
      </div>

      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
         <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
            <form onSubmit={handleSendMessage} className="space-y-3">
               <Input value={composeData.title} onChange={e=>setComposeData({...composeData, title:e.target.value})} placeholder="Title" required className="rounded-xl h-10" />
               <Select value={composeData.selectedStudentId} onValueChange={v=>setComposeData({...composeData, selectedStudentId:v})}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Select Target" /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Students</SelectItem>
                     {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.collegeId})</SelectItem>)}
                  </SelectContent>
               </Select>
               <Textarea value={composeData.content} onChange={e=>setComposeData({...composeData, content:e.target.value})} placeholder="Message content..." required rows={4} className="rounded-xl" />
               <Button type="submit" className="w-full rounded-xl h-11 bg-slate-700 hover:bg-slate-800 text-white">Send Announcement</Button>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ REPORTS PAGE (Faculty) ============

export function ReportsPage() {
  const { riskStudents } = useAppStore();

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Risk', 'Attendance', 'CGPA'];
    const rows = riskStudents.map(s => [s.collegeId, s.name, s.riskLevel, s.attendance+'%', s.cgpa]);
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `risk-report.csv`; a.click();
    toast.success('Report exported');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Analytics Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <Card className="p-6 cursor-pointer hover:bg-slate-50 transition-colors border-0 shadow-md rounded-2xl" onClick={handleExportCSV}>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center"><FileText className="w-6 h-6 text-blue-600"/></div>
               <div><h3 className="font-bold">Student Risk CSV</h3><p className="text-xs text-muted-foreground">Download detailed risk matrix</p></div>
            </div>
         </Card>
      </div>

      <Card className="border-0 shadow-md rounded-2xl p-6">
         <h3 className="text-sm font-bold mb-4">Risk Distribution Summary</h3>
         <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-red-600">{riskStudents.filter(s=>s.riskLevel==='high').length}</p><p className="text-xs text-muted-foreground">High Risk</p></div>
            <div><p className="text-2xl font-bold text-orange-600">{riskStudents.filter(s=>s.riskLevel==='medium').length}</p><p className="text-xs text-muted-foreground">Medium Risk</p></div>
            <div><p className="text-2xl font-bold text-emerald-600">{riskStudents.filter(s=>s.riskLevel==='low').length}</p><p className="text-xs text-muted-foreground">Safe</p></div>
         </div>
      </Card>
    </div>
  );
}
