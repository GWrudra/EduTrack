# EduTrack: Student Affairs Management System

EduTrack is a comprehensive, full-stack application designed to manage student academic performance, attendance, and risk assessment for educational institutions.

## 🚀 Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14/15+](https://nextjs.org/) (App Router) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | SQLite / PostgreSQL |
| **State Management** | [Zustand](https://docs.pmnd.rs/zustand/) |
| **Data Visualization** | [Chart.js](https://www.chartjs.org/) & [React-Chartjs-2](https://react-chartjs-2.js.org/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |

---

## ✨ Key Features

### 👨‍🎓 Student Features
- **Comprehensive Dashboard**: Real-time view of CGPA, Attendance, and Achievement Points.
- **Daily Schedule**: Automatic class schedule based on the student's section and branch.
- **Academic Stats**: Detailed semester-wise breakdown of marks, GPA trends, and grade distribution.
- **Points System**: Gamified experience where students earn points for academic and social achievements.
- **Exams & Assignments**: Track upcoming tests and deadlines with status badges (todo, in progress, overdue).
- **Messaging Profile**: Receive formal warnings or alerts directly from faculty and administration.

### 👨‍🏫 Faculty Features
- **Attendance Management**: 
  - Manual marking for specific classes.
  - **Bulk Import**: Support for CSV-based attendance uploads.
  - **Topic Tracking**: Ability to log specific topics covered in each lecture.
- **Student Risk Analysis**: 
  - Automated risk scoring based on attendance, CGPA, and consistency.
  - Tiered categorization (High, Medium, Low risk).
  - Detailed student profiles with "send warning" or "alert parent" quick actions.
- **Messaging Hub**: Targeted communication to students or parents via the internal messaging system.
- **Timetable Access**: View teaching schedules across different sections and branches.

### 🛡️ Administrative Features
- **System Overview**: High-level analytics of total users, active students, and overall attendance.
- **User Management**: Add, edit, or remove students, faculty, and other admins.
- **Data Import (Prisma-backed)**: Powerful tools to import foundation data like student lists and timetables from CSV.
- **Reporting System**: Export data (Risk Reports, Student Directories) in CSV and JSON formats for external use.

---

## 🎨 Layout & UX
- **Responsive Navigation**: Adaptive sidebar for desktop and bottom-navigation/header for mobile devices.
- **Dark Mode Support**: Full theme switching support for all components.
- **Performance Optimized**: Modular component architecture for fast HMR and reduced bundle sizes.
- **Daily Inspiration**: Integrated daily quote system to motivate students.

---
