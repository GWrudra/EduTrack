# EduTrack — Student Affairs Management System

A comprehensive, full-stack student affairs management system built with **Next.js 16**, designed to streamline academic tracking, attendance management, and communication between students, faculty, and administrators.

---

## ✨ Features

### 👨‍🎓 Student Portal
- **Dashboard** — Premium glassmorphic UI offering a real-time overview of CGPA, attendance percentage, and achievement points
- **Attendance & CGPA Tracker** — Visual trend analysis with semester-wise breakdowns
- **Points System** — Gamified achievements (Academic, Social, Bonus points)
- **Interactive Timetable** — Daily/weekly class schedules with location details
- **Messaging** — Receive warnings, alerts, and announcements from faculty

### 👩‍🏫 Faculty Portal
- **Interactive Analytics** — Beautiful, interactive charts (Doughnut & Bar charts via Chart.js) mapping student risk distribution and attendance ratios
- **Risk Analysis** — Predictive student risk assessment (High/Medium/Low) with point-based scoring
- **Attendance Management** — Mobile-friendly interface with CSV bulk import and topic tracking
- **Messaging Hub** — Send warnings to students or alerts to parents
- **Course Overview** — Manage assignments, exams, and grading

### 🔑 Admin Portal
- **User Management** — Full CRUD operations for students and faculty accounts
- **Bulk Data Import** — Import student lists and timetables (organized by Target Year) from CSV/XLSX files
- **Data Cleanup** — Selective deletion of students, faculty, attendance, marks, or timetable data
- **Security Enhancements** — Upgraded login workflows with password visibility toggles and bulk password resets
- **Database Backup** — Export full system data in JSON/CSV formats
- **Seed Data** — Generate sample academic data for demonstrations

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Standalone Output) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Database** | [Prisma ORM](https://www.prisma.io/) + SQLite |
| **State** | [Zustand](https://github.com/pmndrs/zustand) (LocalStorage persistence) |
| **Charts** | [Chart.js](https://www.chartjs.org/) + [Recharts](https://recharts.org/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Auth** | JWT (bcryptjs) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 Project Structure

```
EduTrack/
├── package.json              # Root — delegates to frontend/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # Pages, layouts, API routes
│   │   │   └── api/          # REST API endpoints
│   │   ├── components/       # UI + dashboard + feature components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Prisma client, Zustand store, utils
│   ├── public/               # Static assets, PWA manifest, service worker
│   ├── package.json
│   ├── next.config.ts
│   └── tailwind.config.ts
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (15 models)
│   │   └── seed.ts           # Database seeder
│   ├── dev.db                # SQLite database file
│   └── infra/
│       └── Caddyfile         # Reverse proxy config (optional)
└── resources/
    ├── docs/                 # PRD, FEATURES documentation
    ├── upload/               # Data import templates (CSV/XLSX)
    └── download/             # Generated export files
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd EduTrack

# 2. Install all dependencies (root + frontend)
npm run install-all

# 3. Set up environment variables
cd frontend
cp .env.example .env   # Then edit .env with your settings
cd ..

# 4. Initialize the database
npm run db:push

# 5. Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Environment Variables

Create `frontend/.env` with:

```env
DATABASE_URL="file:../backend/dev.db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
```

> ⚠️ **Change `JWT_SECRET`** to a strong random string in production.

---

## 📱 Mobile Access (PWA)

1. Ensure your phone and computer are on the **same Wi-Fi network**
2. Find your computer's local IP address (e.g., `192.168.x.x`)
3. Visit `http://YOUR_IP:3000` on your phone's browser
4. Use **"Add to Home Screen"** for a native app-like experience

---

## 🔐 Default Credentials

| Role | ID | Password |
|---|---|---|
| **Admin** | `ADMIN` | `admin123` |
| **Student** | *(imported via CSV)* | `password123` |
| **Faculty** | *(imported via CSV)* | `password123` |

> Change default passwords after first login.

---

## 🏗 Production Build

```bash
# Build for production (standalone output)
npm run build

# Start the production server
npm run start
```

The `standalone` output mode bundles everything needed to run the app without `node_modules`, making it ideal for Docker or VPS deployment.

---

## 📊 Database Schema

The system uses **15 Prisma models**:

| Model | Purpose |
|---|---|
| `User` | Students, faculty, and admin accounts |
| `AttendanceLog` | Daily attendance records with topic tracking |
| `SemesterAttendance` | Aggregated subject-wise attendance per semester |
| `SemesterRecord` | SGPA/CGPA records per semester |
| `SubjectMark` | Individual subject marks and grades |
| `Course` | Course catalog with schedules |
| `CourseEnrollment` | Student-course mappings |
| `Assignment` | Homework and project assignments |
| `AssignmentSubmission` | Student submissions with scores |
| `Exam` | Exam schedules and details |
| `Mark` | Course-level marks |
| `Message` | Internal messaging system |
| `Notification` | System notifications |
| `RiskAssessment` | Pre-calculated student risk scores |
| `TimetableEntry` | Class schedule entries |
| `DailyQuote` | Inspirational quotes for students |
| `PointsLedger` | Gamification points tracking |

---

## 🔧 API Endpoints

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/auth` | POST | Login / authentication |
| `/api/users` | GET, POST, PUT, DELETE | User management |
| `/api/users-cleanup` | DELETE | Bulk data cleanup |
| `/api/attendance` | GET, POST | Attendance management |
| `/api/attendance-dashboard` | GET | Attendance analytics |
| `/api/academic` | GET, POST | Academic records & seeding |
| `/api/timetable` | GET, POST | Timetable management |
| `/api/messages` | GET, POST | Internal messaging |
| `/api/import` | POST | CSV/XLSX data import |
| `/api/export` | GET | Data export (JSON/CSV) |
| `/api/seed-data` | POST | Generate sample data |

---

## 📄 License

This project is licensed under the **MIT License**.
