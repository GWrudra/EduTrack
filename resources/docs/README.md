# EduTrack - Student Affairs Management System

EduTrack is a comprehensive, modern student affairs management system built with Next.js 16, designed to streamline academic tracking, attendance management, and communication between students, faculty, and administrators.

![EduTrack Logo](/public/logo.svg)

## 🚀 Key Features

### 👨‍🎓 For Students
- **Personalized Dashboard**: Real-time overview of academic status, attendance, and achievements.
- **Attendance & CGPA Tracker**: Visual trend analysis of CGPA history and detailed attendance breakdowns.
- **Points System**: Gamified achievements tracking (Academic, Social, and Bonus points).
- **Interactive Timetable**: Daily and weekly class schedules with location details.
- **Direct Messaging**: Receive warnings, alerts, and general info from faculty directly.

### 👩‍🏫 For Faculty
- **Student Risk Analysis**: Predictive risk assessment (High/Medium/Low) based on attendance and performance.
- **Class Attendance Management**: Fast, mobile-friendly interface for updating attendance.
- **Direct Messaging/Alerting**: Send warnings to students or alerts to parents with one click.
- **Course & Exam Overview**: Manage assignments, exams, and grading for allocated courses.

### 🔑 For Administrators
- **User Management**: Comprehensive control over student and faculty user accounts.
- **Bulk Data Import**: Import student lists and timetables from CSV/XLSX.
- **Database Backup**: Export full system data in JSON/CSV formats.
- **System Settings**: Global configuration for semesters and academic years.

## 💻 Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (Using App Router & Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with LocalStorage persistence)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Utility**: [Lucide React](https://lucide.dev/) (Icons), [Zod](https://zod.dev/) (Validation), [Sonner](https://sonner.emilkowal.ski/) (Toasts)

## 🛠 Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd Final
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

4. **Seed Demo Data** (Optional/Recommended):
   ```bash
   # Run the server first
   npm run dev
   # In a new terminal, seed the academic data
   curl -X POST http://localhost:3000/api/academic
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Access (PWA)

To access the system on your mobile phone:
1. Ensure your phone and computer are on the same Wi-Fi network.
2. Find your computer's IP address (e.g., `172.x.x.x`).
3. Visit `http://YOUR_IP:3000` on your phone's browser.
4. **Important**: If the server doesn't respond on your phone, restart it with:
   ```bash
   npx next dev -H 0.0.0.0
   ```
5. Use "Add to Home Screen" in Chrome (Android) or Safari (iOS) for a full PWA experience.

## 🔐 Demo Credentials

| Role | Roll No / Faculty ID | Password |
| :--- | :--- | :--- |
| **Admin** | `ADMIN` | `admin123` |
| **Student** | `CSE001` | `password123` |
| **Faculty** | `T001` | `password123` |

## 📁 Project Structure

- `/src/app`: Next.js App Router (Layouts, Pages, API Routes)
- `/src/components/ui`: Reusable UI components from Shadcn
- `/src/lib`: Core utilities, Prisma client, and Zustand store
- `/prisma`: Database schema and migrations
- `/public`: Static assets (images, icons, manifest)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.