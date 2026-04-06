# PRD: System Fixes & Feature Improvements (Faculty, Admin, Student)

## Overview
Fix UI bugs, improve data consistency, and implement missing features across Faculty, Admin, and Student modules.

---

# 👨‍🏫 Faculty Module

## Task 1: Remove Time Table Page
Remove the timetable page completely from faculty dashboard.
- Remove UI route/page
- Remove related navigation links
- Ensure no broken links remain

## Task 2: Fix Attendance Course Selection UI
Fix course selection dropdown going out of bounds.
- Ensure proper UI alignment
- Make dropdown responsive
- Remove "Break" and "Lunch" from course list

## Task 3: Sync Attendance with Student Dashboard
Ensure attendance updates everywhere.
- Update backend logic for attendance sync
- Reflect changes in student dashboard
- Ensure subject-wise attendance is correct

## Task 4: Fix Risk Analysis Data Issues
Fix incorrect or missing high-risk student data.
- Debug risk calculation logic
- Ensure consistent data rendering
- Handle edge cases (missing data)

## Task 5: Enable Email Alerts in Risk Analysis
Send emails when:
- "Send Warning" clicked
- "Alert Parent" clicked
Tasks:
- Integrate email service
- Fetch parent email ID
- Send proper message content

## Task 6: Add Student Search by Roll No (Messaging)
Improve compose feature:
- Add search by roll number
- Ensure fast lookup
- Validate correct student selection

## Task 7: Fix Reports (Risk Report & Analytics)
- Fix Risk Report generation
- Fix Analytics page data
- Ensure accurate and complete data rendering

---

# 🛠️ Admin Module

## Task 8: View All User Details
Admin should view full user details.
- Show complete profile
- Include student & faculty data
- Ensure proper UI display

## Task 9: Improve Import Data System
Enhance import functionality:
- Allow append data
- Allow full import
- Add delete system:
  - Delete recent data
  - Delete selected student/faculty data

## Task 10: Add Password Reset (Single Student)
- Add password reset option
- Admin can reset one student’s password
- Ensure secure update

## Task 11: Simplify Reports Page
- Remove all reports except:
  - Full Dataset JSON
- Add Export functionality:
  - Export all user data

---

# 🎓 Student Module

## Task 12: Fix Timetable Updates
- Ensure timetable updates properly
- Sync with backend data

## Task 13: Improve Attendance & CGPA View
- Show CGPA for all semesters
- Show attendance for last 2 semesters only

## Task 14: Fix Messaging System
- Ensure student messages reach faculty
- Fix message delivery issues

## Task 15: Maintain Chat History
- Store message history
- Load previous chats properly

---

# 🔐 Global Task

## Task 16: Fix Password Update System
- After password change:
  - User must login with new password
- Ensure old password is invalid
- Validate authentication flow