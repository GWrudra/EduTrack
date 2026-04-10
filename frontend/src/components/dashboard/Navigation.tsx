'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Home, Calendar, Award, BarChart3, MessageSquare, Settings, 
  Users, UserCheck, AlertTriangle, Send, FileText, Upload, 
  ChevronLeft, LogOut, Menu, X, Bell, Database
} from 'lucide-react';
import { getInitial } from '@/lib/utils';
import { ChangePasswordDialog } from '@/components/auth/AuthComponents';
import { NotificationsDialog } from '@/components/modals/DialogComponents';

// ============ SIDEBAR COMPONENT (Desktop) ============

export function DesktopSidebar() {
  const { user, activeTab, setActiveTab, sidebarCollapsed, toggleSidebarCollapsed, logout, messages } = useAppStore();
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

  const userMessages = user?.role === 'student'
    ? messages.filter(m => m.senderId === user.id || m.receiverId === user.id || m.targetType === 'student' || m.targetType === 'all')
    : messages;
  const unreadCount = userMessages.filter(m => !m.isRead).length;

  return (
    <>
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <img src="/Logo1.jpeg" alt="EduTrack" className="w-10 h-10 rounded-xl object-contain bg-white shadow-sm" />
                <div>
                  <h1 className="font-bold text-lg leading-tight">EduTrack</h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Student Affairs</p>
                </div>
              </div>
            )}
          </div>
        </div>


        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''} ${activeTab === item.id ? 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 shadow-sm' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground'}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-slate-500' : ''}`} />
                {!sidebarCollapsed && item.label}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Button variant="ghost" onClick={toggleSidebarCollapsed} className={`w-full rounded-xl ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>

          {!sidebarCollapsed && (
            <>
              <Button variant="ghost" className="w-full justify-start rounded-xl" onClick={() => setShowChangePassword(true)}>
                <Settings className="w-5 h-5 mr-2" />
                Change Password
              </Button>
              <Button variant="ghost" className="w-full justify-start rounded-xl text-red-500" onClick={logout}>
                <LogOut className="w-5 h-5 mr-2" />
                Logout
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

export function MobileBottomNav() {
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

  const adminMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'import', label: 'Import', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'More', icon: Settings },
  ];

  const menuItems = user?.role === 'admin' 
    ? adminMenuItems 
    : user?.role === 'faculty' 
      ? facultyMenuItems 
      : studentMenuItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl ${activeTab === item.id ? 'text-slate-600 dark:text-slate-400' : 'text-muted-foreground'}`}
          >
            <div className={`p-1.5 rounded-xl ${activeTab === item.id ? 'bg-slate-100 dark:bg-slate-900/30' : ''}`}>
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

export function MobileHeader({ onOpenNotifications, unreadCount }: { onOpenNotifications: () => void; unreadCount: number }) {
  const { user, logout } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/Logo1.jpeg" alt="EduTrack" className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm" />
            <div>
              <h1 className="font-bold text-sm leading-tight">EduTrack</h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onOpenNotifications} className="rounded-full h-9 w-9 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowMenu(true)} className="rounded-full h-9 w-9">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="rounded-t-3xl fixed bottom-0 top-auto">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-lg">
                  {getInitial(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.collegeId}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12" onClick={() => { setShowMenu(false); setShowChangePassword(true); }}>
              <Settings className="w-5 h-5 mr-3" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12 text-red-500" onClick={handleLogout}>
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
