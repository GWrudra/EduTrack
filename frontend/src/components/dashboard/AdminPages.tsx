'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GraduationCap, 
  UserCheck, 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Trash2, 
  RefreshCw, 
  Download, 
  Upload, 
  Eye, 
  Key, 
  BarChart3, 
  Database, 
  Calendar, 
  Plus, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

// ============ ADMIN DASHBOARD ============

export function AdminDashboard() {
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
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-red-500/10 rounded-full blur-xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 w-full gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">System Administration</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">Admin Dashboard</h1>
            <Badge variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-slate-100 backdrop-blur-md">
              System Overview
            </Badge>
          </div>
          <div className="mt-2 md:mt-0 text-right bg-white/5 rounded-xl p-3 sm:px-4 sm:py-3 backdrop-blur-sm border border-white/10 shrink-0 min-w-fit flex md:block items-center gap-3">
            <div className="text-2xl sm:text-3xl font-bold text-white leading-none">{new Date().getDate()}</div>
            <div className="text-[10px] sm:text-xs text-slate-300 uppercase tracking-widest font-medium mt-0 md:mt-1">
              {new Date().toLocaleDateString('en-US', {month:'short', year:'numeric'})}
            </div>
            <div className="hidden md:block text-[10px] text-slate-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>
        </div>
      </div>

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
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-xs text-muted-foreground">System Alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('import')}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold">Bulk Import</h3>
                <p className="text-sm text-muted-foreground">Upload users, timetable, marks</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold">User Management</h3>
                <p className="text-sm text-muted-foreground">Manage students and faculty</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ ADMIN USERS COMPONENT ============

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newSingleUserPassword, setNewSingleUserPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.collegeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will remove all their records.')) return;
    try {
      const res = await fetch(`/api/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUserPassword = async () => {
    if (!selectedUserForPassword || !newSingleUserPassword || newSingleUserPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
    }
    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/users', { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUserForPassword.id, password: newSingleUserPassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Password updated for ${selectedUserForPassword.name}`);
        setShowPasswordDialog(false);
        setNewSingleUserPassword('');
        setSelectedUserForPassword(null);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage system users and their accounts</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="rounded-xl h-8">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl h-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'student', 'faculty'].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter(role as any)}
              className="rounded-xl h-10 px-4 capitalize"
            >
              {role}s
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">ID / Reg No</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Email</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No users found</td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{user.collegeId}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-[10px] rounded-lg capitalize ${
                          user.role === 'admin' ? 'bg-red-50 text-red-700' :
                          user.role === 'faculty' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.email || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedUserForPassword(user); setShowPasswordDialog(true); }}
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === 'admin'}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
         <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Reset Account Password</DialogTitle>
              <DialogDescription>
                Changing password for <span className="font-bold text-slate-900">{selectedUserForPassword?.name}</span> ({selectedUserForPassword?.collegeId})
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>New Secure Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    placeholder="Enter new password..."
                    value={newSingleUserPassword}
                    onChange={(e) => setNewSingleUserPassword(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Minimum 6 characters required.</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
               <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
               <Button 
                onClick={handleUpdateUserPassword} 
                disabled={updatingPassword || newSingleUserPassword.length < 6}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
               >
                {updatingPassword ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Update Password
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ ADMIN IMPORT COMPONENT ============

export function AdminImportPage() {
  const { user, triggerDataUpdate } = useAppStore();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<'students' | 'faculty' | 'marks' | 'timetable' | 'attendance' | 'all' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  
  const [stats, setStats] = useState({ total: 0, students: 0, faculty: 0 });
  const [timetableSummaries, setTimetableSummaries] = useState<{ section: string; count?: number; semester?: number }[]>([]);

  const [resetPassword, setResetPassword] = useState('');
  const [resetRole, setResetRole] = useState<'students' | 'faculty' | 'all'>('students');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [initializingAcademic, setInitializingAcademic] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("4");

  const studentCsvRef = useRef<HTMLInputElement>(null);
  const facultyCsvRef = useRef<HTMLInputElement>(null);
  const cgpaCsvRef = useRef<HTMLInputElement>(null);
  const attendanceCsvRef = useRef<HTMLInputElement>(null);
  const timetableRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const uRes = await fetch('/api/users');
      const uData = await uRes.json();
      if (uData.success) {
        setStats({ total: uData.stats.total, students: uData.stats.students, faculty: uData.stats.faculty });
      }

      const tRes = await fetch('/api/timetable');
      const tData = await tRes.json();
      if (tData.success) {
        setTimetableSummaries(tData.summaries || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCsvImport = async (role: 'student' | 'faculty') => {
    const fileInput = role === 'student' ? studentCsvRef.current : facultyCsvRef.current;
    if (!fileInput?.files?.[0]) return;

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target?.result as string;
      setImporting(true);
      try {
        const res = await fetch('/api/import', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: role === 'student' ? 'students' : 'faculty', 
            data: csvText, 
            mode: importMode 
          }) 
        });
        const result = await res.json();
        setImportResult(result.results || result);
        setShowResultDialog(true);
        if (result.success) {
          fetchData();
          triggerDataUpdate();
        }
      } catch (error) {
        toast.error('Failed to import users');
      } finally {
        setImporting(false);
        fileInput.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleCgpaImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      setImporting(true);
      try {
        const res = await fetch('/api/academic/import', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: csvText, mode: importMode }) 
        });
        const result = await res.json();
        setImportResult(result.results || result);
        setShowResultDialog(true);
        if (result.success) triggerDataUpdate();
      } catch (error) { toast.error('Failed to import academic data'); }
      finally { setImporting(false); e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleAttendanceImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      setImporting(true);
      try {
        const res = await fetch('/api/attendance/import', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: csvText, mode: importMode }) 
        });
        
        let result;
        try {
          result = await res.json();
        } catch (jsonErr) {
          toast.error("Failed to parse response from server.");
          return;
        }

        if (!result.success && !result.results) {
           toast.error(result.message || 'Failed to import attendance');
           return;
        }

        setImportResult(result.results || result);
        setShowResultDialog(true);
        if (result.success) triggerDataUpdate();
      } catch (error) { toast.error('Failed to connect to the server'); }
      finally { setImporting(false); e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleTimetableImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('mode', importMode);
    formData.append('semester', selectedSemester);

    try {
      const res = await fetch('/api/timetable/import', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        toast.success(`Timetable imported: ${result.results.success} entries across the system`);
        fetchData();
        triggerDataUpdate();
      } else {
        toast.error(result.message || 'Failed to import timetable');
      }
    } catch (error) { toast.error('Failed to import timetable'); }
    finally { setImporting(false); e.target.value = ''; }
  };

  const handleInitializeAcademic = async () => {
    setInitializingAcademic(true);
    try {
      const res = await fetch('/api/initialize-academic', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        triggerDataUpdate();
      } else { toast.error(result.message); }
    } catch { toast.error('Failed to initialize'); }
    finally { setInitializingAcademic(false); }
  };

  const handleDeleteAll = async (type: 'students' | 'faculty' | 'marks' | 'timetable' | 'attendance' | 'all') => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/users-cleanup?type=${type}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully cleared ${type} data`);
        setShowDeleteDialog(null);
        fetchData();
        triggerDataUpdate();
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to cleanup data'); }
    finally { setDeleting(false); }
  };

  const handleResetPasswords = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/reset-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: resetRole, newPassword: resetPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reset passwords for ${data.count} users`);
        setShowResetDialog(false);
        setResetPassword('');
      } else { toast.error(data.message); }
    } catch { toast.error('Reset failed'); }
    finally { setResetting(false); }
  };

  const downloadTemplate = (type: string) => {
    let content = '';
    let filename = '';
    if (type === 'student') {
       content = 'collegeId,name,email,password,phone,branch,section,year,semester,parentEmail,parentPhone\nREG001,John Doe,john@example.com,password123,9876543210,CSE,A,4,7,parent@example.com,9876543211';
       filename = 'students_template.csv';
    } else if (type === 'faculty') {
       content = 'collegeId,name,password,email,phone,department\nFAC001,Dr. Smith,pass123,smith@univ.edu,9876543210,CSE';
       filename = 'faculty_template.csv';
    } else if (type === 'attendance') {
       content = 'collegeId,date,subject,status,topicCovered\nREG001,2024-03-25,CSE-401,present,React Components';
       filename = 'attendance_template.csv';
    } else if (type === 'academic') {
       content = 'collegeId,Subject Code,Grade,Subject Name,Credit,Sem\nREG001,CSE-101,A,Data Structures,4,1';
       filename = 'academic_template.csv';
    }
    
    if (content) {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Import Center</h2>
          <p className="text-sm text-muted-foreground">Manage bulk data operations and system initializations</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
           <Button 
            size="sm" 
            variant={importMode === 'append' ? 'default' : 'ghost'} 
            onClick={() => setImportMode('append')} 
            disabled={importing}
            className="rounded-xl h-9 px-4 text-xs font-semibold transition-all"
           >
            Append
           </Button>
           <Button 
            size="sm" 
            variant={importMode === 'replace' ? 'default' : 'ghost'} 
            onClick={() => setImportMode('replace')} 
            disabled={importing}
            className="rounded-xl h-9 px-4 text-xs font-semibold transition-all"
           >
            Replace
           </Button>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="flex w-full overflow-x-auto h-12 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 scrollbar-hide">
          <TabsTrigger value="students" disabled={importing} className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Students</TabsTrigger>
          <TabsTrigger value="academic" disabled={importing} className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Marks</TabsTrigger>
          <TabsTrigger value="attendance" disabled={importing} className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Attendance</TabsTrigger>
          <TabsTrigger value="faculty" disabled={importing} className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Faculty</TabsTrigger>
          <TabsTrigger value="timetable" disabled={importing} className="flex-1 rounded-xl text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Timetable</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="students" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30">
                <CardTitle className="text-md font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  </div>
                  Import Students
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" onClick={() => downloadTemplate('student')} className="rounded-2xl h-14 border-dashed hover:bg-slate-50 transition-all font-semibold">
                    <Download className="w-5 h-5 mr-2 text-muted-foreground" /> Download Template
                  </Button>
                  <input ref={studentCsvRef} type="file" accept=".csv" className="hidden" onChange={() => handleCsvImport('student')} />
                  <Button size="lg" onClick={() => studentCsvRef.current?.click()} disabled={importing} className="rounded-2xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-none font-semibold">
                    {importing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />} Upload CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                    <RefreshCw className="w-4 h-4" /> Risk Initialization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <p className="text-xs text-muted-foreground mb-4">Update all risk profiles and points.</p>
                  <Button onClick={handleInitializeAcademic} disabled={initializingAcademic} className="w-full rounded-2xl h-11 bg-emerald-600 hover:bg-emerald-700 font-bold transition-all">
                    {initializingAcademic ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} Initialize Records
                  </Button>
                </CardContent>
              </Card>

              {/* Student Danger Zone */}
              <Card className="border border-red-100 dark:border-red-900/30 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-red-50 dark:bg-red-950/20 py-3 border-b border-red-100 dark:border-red-900/30">
                  <CardTitle className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Student Cleanup
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-11 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-bold transition-all" 
                    onClick={() => setShowDeleteDialog('students')}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete All Student Data
                  </Button>
                  <div className="flex gap-2">
                    <Input 
                        value={resetPassword} 
                        onChange={e=>setResetPassword(e.target.value)} 
                        placeholder="Bulk reset password..." 
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border-none ring-1 ring-slate-200" 
                    />
                    <Button 
                      onClick={() => { setResetRole('students'); setShowResetDialog(true); }} 
                      disabled={!resetPassword || resetPassword.length < 6} 
                      className="rounded-xl h-11 px-4 font-bold bg-slate-900 text-white text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30">
                <CardTitle className="text-md font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-orange-600" />
                  </div>
                  Import Academic Marks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" onClick={() => downloadTemplate('academic')} className="rounded-2xl h-14 border-dashed hover:bg-slate-50 transition-all font-semibold">
                    <Download className="w-5 h-5 mr-2 text-muted-foreground" /> Download Template
                  </Button>
                  <input ref={cgpaCsvRef} type="file" accept=".csv" className="hidden" onChange={handleCgpaImport} />
                  <Button size="lg" onClick={() => cgpaCsvRef.current?.click()} disabled={importing} className="rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-100 dark:shadow-none font-semibold">
                    {importing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />} Upload CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Academic Cleanup */}
            <Card className="border border-red-100 dark:border-red-900/30 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
               <CardHeader className="bg-red-50 dark:bg-red-950/20 py-3 border-b border-red-100 dark:border-red-900/30">
                  <CardTitle className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Academic Record Cleanup
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">Clear all Semester Records, SGPA/CGPA data, and Subject Marks. This is irreversible.</div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteDialog('marks')}
                      className="rounded-2xl h-11 px-8 font-bold whitespace-nowrap"
                    >
                      Delete All Exam Marks
                    </Button>
                  </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30">
                <CardTitle className="text-md font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  Import Attendance Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" onClick={() => downloadTemplate('attendance')} className="rounded-2xl h-14 border-dashed hover:bg-slate-50 transition-all font-semibold">
                    <Download className="w-5 h-5 mr-2 text-muted-foreground" /> Download Template
                  </Button>
                  <input ref={attendanceCsvRef} type="file" accept=".csv" className="hidden" onChange={handleAttendanceImport} />
                  <Button size="lg" onClick={() => attendanceCsvRef.current?.click()} disabled={importing} className="rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 dark:shadow-none font-semibold">
                    {importing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />} Upload CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="space-y-6">
             <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
               <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30">
                 <CardTitle className="text-md font-bold flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                     <UserCheck className="w-4 h-4 text-purple-600" />
                   </div>
                   Import Faculty Members
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" onClick={() => downloadTemplate('faculty')} className="rounded-2xl h-14 border-dashed hover:bg-slate-50 transition-all font-semibold">
                      <Download className="w-5 h-5 mr-2 text-muted-foreground" /> Download Template
                    </Button>
                    <input ref={facultyCsvRef} type="file" accept=".csv" className="hidden" onChange={() => handleCsvImport('faculty')} />
                    <Button size="lg" onClick={() => facultyCsvRef.current?.click()} disabled={importing} className="rounded-2xl h-14 bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-100 dark:shadow-none font-semibold">
                      {importing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />} Upload CSV
                    </Button>
                  </div>
               </CardContent>
             </Card>

             {/* Faculty Danger Zone */}
             <Card className="border border-red-100 dark:border-red-900/30 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-red-50 dark:bg-red-950/20 py-3 border-b border-red-100 dark:border-red-900/30">
                  <CardTitle className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Faculty Cleanup
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="flex flex-col md:flex-row gap-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-11 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-bold transition-all" 
                        onClick={() => setShowDeleteDialog('faculty')}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete All Faculty
                      </Button>
                      <div className="flex flex-1 gap-2">
                        <Input 
                            value={resetPassword} 
                            onChange={e=>setResetPassword(e.target.value)} 
                            placeholder="Reset faculty passwords..." 
                            className="h-11 rounded-xl bg-slate-50 text-xs border-none ring-1 ring-slate-200" 
                        />
                        <Button 
                          onClick={() => { setResetRole('faculty'); setShowResetDialog(true); }} 
                          disabled={!resetPassword || resetPassword.length < 6} 
                          className="rounded-xl h-11 px-4 font-bold bg-slate-900 text-white text-xs"
                        >
                          Reset
                        </Button>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="timetable" className="space-y-6">
             <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
               <CardHeader className="pb-4 bg-slate-50/50 dark:bg-slate-800/30">
                 <CardTitle className="text-md font-bold flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                     <Calendar className="w-4 h-4 text-indigo-600" />
                   </div>
                   Timetable Excel Upload
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="mb-4">
                    <Label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Target Year</Label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger className="w-full h-12 rounded-xl">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {[1, 2, 3, 4].map(year => (
                          <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <input ref={timetableRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleTimetableImport} />
                  <Button size="lg" onClick={() => timetableRef.current?.click()} disabled={importing} className="w-full rounded-2xl h-16 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 dark:shadow-none font-bold text-lg">
                    {importing ? <RefreshCw className="w-6 h-6 mr-3 animate-spin" /> : <Upload className="w-6 h-6 mr-3" />} Select Excel File
                  </Button>
               </CardContent>
             </Card>
             
             <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Sections</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog('timetable')} className="text-xs text-red-600 hover:bg-red-50 rounded-xl h-8">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Timetable
                  </Button>
                </div>

                {timetableSummaries.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {timetableSummaries.map((s, idx) => (
                      <div key={`${s.section}-${s.semester || idx}`} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-center shadow-sm hover:border-indigo-500 transition-colors group">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-sm">Sec {s.section}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse group-hover:scale-125 transition-transform" />
                          </div>
                          {s.semester ? (
                            <span className="text-xs text-muted-foreground mt-1 font-medium">
                              Year {Math.ceil(s.semester / 2)} • Sem {s.semester}
                            </span>
                          ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-muted-foreground bg-slate-50/30">
                    <Calendar className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">No active timetables found</p>
                    <p className="text-xs">Upload an Excel file to see the section peek</p>
                  </div>
                )}
             </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
         <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Import Results</DialogTitle></DialogHeader>
            {importResult && (
               <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4 text-center">
                     <div className="p-4 rounded-2xl bg-green-50 text-green-700"><p className="text-2xl font-bold">{importResult.success}</p><p>Success</p></div>
                     <div className="p-4 rounded-2xl bg-red-50 text-red-700"><p className="text-2xl font-bold">{importResult.failed}</p><p>Failed</p></div>
                  </div>
                  {importResult.details && importResult.details.length > 0 && (
                     <div className="max-h-40 overflow-y-auto p-2 bg-muted rounded-xl text-xs space-y-1">
                        {importResult.details.slice(0, 10).map((err: any, i: number) => <p key={i} className="text-red-600">{err.collegeid}: {err.error}</p>)}
                     </div>
                  )}
               </div>
            )}
            <DialogFooter><Button onClick={() => setShowResultDialog(false)} className="rounded-xl">Close</Button></DialogFooter>
         </DialogContent>
      </Dialog>
      
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
         <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle className="text-red-600">Permanent Deletion</DialogTitle><DialogDescription>Are you absolutely sure? This cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter className="gap-2">
               <Button variant="outline" onClick={() => setShowDeleteDialog(null)} className="flex-1 rounded-xl">Cancel</Button>
               <Button variant="destructive" onClick={() => handleDeleteAll(showDeleteDialog!)} className="flex-1 rounded-xl">Confirm Delete</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
         <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>Bulk Password Reset</DialogTitle><DialogDescription>Reset passwords for {resetRole} to "{resetPassword}"?</DialogDescription></DialogHeader>
            <DialogFooter className="gap-2">
               <Button variant="outline" onClick={() => setShowResetDialog(false)} className="flex-1 rounded-xl">Cancel</Button>
               <Button onClick={handleResetPasswords} className="flex-1 rounded-xl">Continue</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
