'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
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

// Register Chart.js components
if (typeof window !== 'undefined') {
  ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);
}

import { LoginPage, ChangePasswordDialog } from '@/components/auth/AuthComponents';
import { StudentDetailsDialog, NotificationsDialog } from '@/components/modals/DialogComponents';
import { PointsPage } from '@/components/features/FeaturesComponents';
import { DesktopSidebar, MobileBottomNav, MobileHeader } from '@/components/dashboard/Navigation';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TimetablePage } from '@/components/dashboard/TimetablePage';
import { 
  ExamsPage, 
  StatisticsPage, 
  AttendanceCGPAPage, 
  MessagesPage, 
  SettingsPage 
} from '@/components/dashboard/StudentPages';
import { 
  AdminDashboard, 
  AdminUsersPage, 
  AdminImportPage 
} from '@/components/dashboard/AdminPages';
import { 
  FacultyDashboard, 
  AttendanceUpdatePage, 
  StudentsPage, 
  RiskAnalysisPage, 
  MessagingPage, 
  ReportsPage 
} from '@/components/dashboard/FacultyPages';
import { 
  CoursesPage, 
  AssignmentsPage 
} from '@/components/dashboard/ActivityPages';

export default function EduTrackApp() {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    sidebarCollapsed, 
    messages,
    setUser,
    setToken,
    fetchMessages
  } = useAppStore();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, fetchMessages]);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // If not logged in, show login page
  if (!user) {
    return <LoginPage onLogin={(u, t) => { setUser(u); setToken(t); }} />;
  }

  const unreadCount = messages.filter(m => !m.isRead).length;

  // Render content based on active tab and user role
  const renderContent = () => {
    // Role-specific routing logic
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'users': return <AdminUsersPage />;
        case 'import': return <AdminImportPage />;
        case 'reports': return <ReportsPage />;
        case 'settings': return <SettingsPage />;
        default: return <AdminDashboard />;
      }
    }

    if (user.role === 'faculty') {
      switch (activeTab) {
        case 'dashboard': return <FacultyDashboard />;
        case 'attendance': return <AttendanceUpdatePage />;
        case 'students': return <StudentsPage />;
        case 'risk-analysis': return <RiskAnalysisPage />;
        case 'messaging': return <MessagingPage />;
        case 'reports': return <ReportsPage />;
        case 'settings': return <SettingsPage />;
        default: return <FacultyDashboard />;
      }
    }

    // Default: Student role
    switch (activeTab) {
      case 'dashboard': return <StudentDashboard />;
      case 'courses': return <CoursesPage />;
      case 'timetable': return <TimetablePage />;
      case 'assignments': return <AssignmentsPage />;
      case 'exams': return <ExamsPage />;
      case 'statistics': return <StatisticsPage />;
      case 'points': return <PointsPage />;
      case 'attendance-cgpa': return <AttendanceCGPAPage />;
      case 'messages': return <MessagesPage />;
      case 'settings': return <SettingsPage />;
      default: return <StudentDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <MobileHeader 
          onOpenNotifications={() => setIsNotificationsOpen(true)} 
          unreadCount={unreadCount} 
        />

        {/* Top Navigation Bar (Desktop Only) */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 capitalize tracking-tight">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative group"
              >
                <i className="lucide-bell w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-bold shadow-md shadow-slate-200 dark:shadow-none font-sans">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                <p className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 uppercase font-bold">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 pt-20 md:p-8 md:pt-8 pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </main>

      {/* Global Dialogs */}
      <NotificationsDialog 
        open={isNotificationsOpen} 
        onOpenChange={setIsNotificationsOpen} 
      />
      <ChangePasswordDialog 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
      <StudentDetailsDialog 
        open={false} 
        onOpenChange={() => {}} 
        student={null} 
      />
    </div>
  );
}
