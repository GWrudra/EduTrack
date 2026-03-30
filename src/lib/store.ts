import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  collegeId: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  email?: string;
  phone?: string;
  branch?: string;
  section?: string;
  year?: number;
  semester?: number;
  loginTime?: string;
  parentEmail?: string;
  parentPhone?: string;
  department?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string;
  department?: string;
  semester?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  location?: string;
  weekStart?: number;
  weekEnd?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  description?: string;
  dueDate: Date;
  maxScore?: number;
  status: 'todo' | 'in_progress' | 'completed' | 'overdue';
}

export interface Exam {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  examDate: Date;
  duration?: number;
  location?: string;
  examType: 'midterm' | 'final' | 'quiz';
}

export interface Mark {
  id: string;
  courseId: string;
  courseName?: string;
  semester: number;
  score: number;
  grade?: string;
  gradePoints?: number;
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  status: 'present' | 'absent' | 'late';
  date: Date;
}

export interface PointsRecord {
  totalPoints: number;
  socialPoints: number;
  academicPoints: number;
}

export interface StudentRiskInfo {
  id: string;
  collegeId: string;
  name: string;
  branch: string;
  section: string;
  year: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  attendance: number;
  cgpa: number;
  totalPoints: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId?: string;
  targetType: 'student' | 'parent' | 'all';
  title: string;
  content: string;
  messageType: 'warning' | 'alert' | 'info';
  isRead: boolean;
  sentAt: Date;
}

export interface DailyQuote {
  quote: string;
  author?: string;
  category?: string;
}

// Store state
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;

  // UI State
  activeTab: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';

  // Data refresh tracking - using a counter for reliable updates
  dataUpdateCounter: number;

  // Data
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  marks: Mark[];
  attendance: AttendanceRecord[];
  points: PointsRecord;
  riskStudents: StudentRiskInfo[];
  messages: Message[];
  dailyQuote: DailyQuote;

  // Timetable quick view filters
  timetableFilters: { section: string | null; semester: number | null };

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  triggerDataUpdate: () => void;
  forceRefresh: () => void;
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  setExams: (exams: Exam[]) => void;
  addExam: (exam: Exam) => void;
  setMarks: (marks: Mark[]) => void;
  setAttendance: (attendance: AttendanceRecord[]) => void;
  setPoints: (points: PointsRecord) => void;
  setRiskStudents: (students: StudentRiskInfo[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  fetchMessages: () => Promise<void>;
  setDailyQuote: (quote: DailyQuote) => void;
  setTimetableFilters: (filters: { section: string | null; semester: number | null }) => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

// Generate random quote
const getRandomQuote = (): DailyQuote => {
  const quotes = [
    { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Create store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      token: null,

      // UI State
      activeTab: 'dashboard',
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'light',
      dataUpdateCounter: 0,

      // Data
      courses: [],
      assignments: [],
      exams: [],
      marks: [],
      attendance: [],
      points: { totalPoints: 0, socialPoints: 0, academicPoints: 0 },
      riskStudents: [],
      messages: [],
      dailyQuote: getRandomQuote(),
      timetableFilters: { section: null, semester: null },

      // Actions
      setUser: (user) => {
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem('edutrack_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('edutrack_user');
          }
        }
        set({ user, isAuthenticated: !!user });
      },
      setToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('edutrack_token', token);
          } else {
            localStorage.removeItem('edutrack_token');
          }
        }
        set({ token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('edutrack_user');
          localStorage.removeItem('edutrack_token');
        }
        set({ user: null, isAuthenticated: false, token: null });
      },
      setActiveTab: (activeTab) => set({ activeTab }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      triggerDataUpdate: () => set((state) => ({ dataUpdateCounter: state.dataUpdateCounter + 1 })),
      forceRefresh: () => set((state) => ({ dataUpdateCounter: state.dataUpdateCounter + 1 })),
      setCourses: (courses) => set({ courses }),
      addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
      updateCourse: (id, course) => set((state) => ({
        courses: state.courses.map((c) => c.id === id ? { ...c, ...course } : c)
      })),
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id)
      })),
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) => set((state) => ({ assignments: [...state.assignments, assignment] })),
      updateAssignment: (id, assignment) => set((state) => ({
        assignments: state.assignments.map((a) => a.id === id ? { ...a, ...assignment } : a)
      })),
      deleteAssignment: (id) => set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id)
      })),
      setExams: (exams) => set({ exams }),
      addExam: (exam) => set((state) => ({ exams: [...state.exams, exam] })),
      setMarks: (marks) => set({ marks }),
      setAttendance: (attendance) => set({ attendance }),
      setPoints: (points) => set({ points }),
      setRiskStudents: (riskStudents) => set({ riskStudents }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      fetchMessages: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const res = await fetch(`/api/messages?userId=${user.id}`);
          const data = await res.json();
          if (data.success) {
            set({ messages: data.messages });
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      },
      setDailyQuote: (dailyQuote) => set({ dailyQuote }),
      setTimetableFilters: (timetableFilters) => set({ timetableFilters }),
      exportData: () => {
        const state = get();
        return JSON.stringify({
          courses: state.courses,
          assignments: state.assignments,
          exams: state.exams,
          marks: state.marks,
          attendance: state.attendance,
        });
      },
      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set({
            courses: parsed.courses || [],
            assignments: parsed.assignments || [],
            exams: parsed.exams || [],
            marks: parsed.marks || [],
            attendance: parsed.attendance || [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'edutrack-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        theme: state.theme,
        courses: state.courses,
        assignments: state.assignments,
        exams: state.exams,
        marks: state.marks,
        attendance: state.attendance,
        points: state.points,
      }),
    }
  )
);
