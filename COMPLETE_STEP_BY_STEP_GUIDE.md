# 🚀 COMPLETE STEP-BY-STEP SETUP GUIDE

## ✅ STATUS: YOUR SERVERS ARE RUNNING!

**Backend:** http://localhost:8000 ✅  
**Frontend:** http://localhost:3000 ✅  
**Database:** university_db ✅ (All tables created)

---

## 📋 STEP-BY-STEP WORKFLOW

### ⏱️ TOTAL TIME: ~15 minutes

---

## 🔐 STEP 1: CREATE ADMIN ACCOUNT (First Time Only)

**Go to:** http://localhost:3000/register

**Fill in:**
```
Email:           admin@university.com
First Name:      System
Last Name:       Admin
Password:        Admin@123456
Confirm Password: Admin@123456
Role:            [SELECT: Admin ⚙️]
✓ Accept Terms
```

**Click:** Complete Register

**Result:** 
```
✅ Registration successful!
⏳ Waiting for admin approval (you)
⏱️ Auto-redirects to login in 3 seconds
```

---

## 👨‍🏫 STEP 2: APPROVE ADMIN (Manual)

**Go to:** http://localhost:3000/login

**Login as:**
```
Email:    admin@university.com
Password: Admin@123456
```

**What you'll see:**
- ⏳ "Fetching admin credentials..." message
- Admin Dashboard loads
- Top-right shows: **System Admin** + Logout button

**But wait!** Admin is still pending approval. We need to approve admin first.

---

## 🔄 STEP 3: FIX - AUTO-APPROVE ADMIN IN DATABASE

**Open SQL Server Management Studio:**

1. Connect to: `MAHI\SQLEXPRESS`
2. Click New Query
3. Paste this code:

```sql
UPDATE users 
SET approval_status = 'approved', 
    approved_by = 1
WHERE email = 'admin@university.com' AND role = 'admin'
```

4. Press F5 to Execute
5. ✅ Admin approved!

**Refresh browser:** http://localhost:3000/login  
**Login again with admin credentials**  
✅ Now fully logged in!

---

## 👨‍🏫 STEP 4: CREATE FACULTY ACCOUNT

**Logout:** Click [Logout] button top-right

**Go to:** http://localhost:3000/register

**Fill in:**
```
Email:           faculty1@university.com
First Name:      Ahmed
Last Name:       Khan
Password:        Faculty@123456
Confirm Password: Faculty@123456
Role:            [SELECT: Faculty 👨‍🏫]
✓ Accept Terms
```

**Click:** Complete Register

**Result:**
```
✅ Registration successful!
Your account is pending admin approval
⏱️ Auto-redirects to login in 3 seconds
```

---

## ✅ STEP 5: ADMIN APPROVES FACULTY

**Login as Admin:** http://localhost:3000/login
```
Email:    admin@university.com
Password: Admin@123456
```

**Go to:** Click [👑 Super Admin Dashboard]

**Click:** [Review Approvals] button  
**(Shows: Pending Approvals (1))**

**Find:** Ahmed Khan (Faculty)

**Click:** [✅ Approve]

**Result:**
```
✅ User Ahmed Khan approved successfully
Faculty now can login and add courses
```

---

## 🎓 STEP 6: FACULTY LOGS IN & CREATES COURSE

**Logout:** Click [Logout] button top-right

**Login as Faculty:** http://localhost:3000/login
```
Email:    faculty1@university.com
Password: Faculty@123456
```

**Top-right shows:** Ahmed Khan + Logout button ✅

**Go to:** [Faculty Dashboard]

**Click:** [My Courses] 

**Click:** [➕ Create Course] button

**Fill in Course Details:**
```
Course Code:     CS101
Course Name:     Introduction to Programming
Credits:         3
Category:        Computer Science
Level:           Undergraduate
```

**Click:** [Create Course]

**Result:**
```
✅ Course created successfully!
Course now visible to all students
┌─────────────────────────────────┐
│ My Courses                      │
├─────────────────────────────────┤
│ CS101 - Programming Basics      │
│ Created: Today                  │
│ 0 students enrolled             │
│ [Delete Course]                 │
└─────────────────────────────────┘
```

---

## 👨‍🎓 STEP 7: CREATE STUDENT ACCOUNT

**Logout:** Click [Logout] button top-right

**Go to:** http://localhost:3000/register

**Fill in:**
```
Email:           student1@university.com
First Name:      Ali
Last Name:       Hassan
Password:        Student@123456
Confirm Password: Student@123456
Role:            [SELECT: Student 👨‍🎓]
✓ Accept Terms
```

**Click:** Complete Register

**Result:**
```
✅ Registration successful!
Your account is pending admin approval
⏱️ Auto-redirects to login in 3 seconds
```

---

## ✅ STEP 8: ADMIN APPROVES STUDENT

**Login as Admin:** http://localhost:3000/login
```
Email:    admin@university.com
Password: Admin@123456
```

**Click:** [👑 Super Admin Dashboard]

**Click:** [Review Approvals] button  
**(Shows: Pending Approvals (1))**

**Find:** Ali Hassan (Student)

**Click:** [✅ Approve]

**Result:**
```
✅ User Ali Hassan approved successfully
Student now can login and enroll in courses
```

---

## 📚 STEP 9: STUDENT LOGS IN & VIEWS AVAILABLE COURSES

**Logout:** Click [Logout] button top-right

**Login as Student:** http://localhost:3000/login
```
Email:    student1@university.com
Password: Student@123456
```

**Top-right shows:** Ali Hassan + Logout button ✅

**Go to:** [Student Dashboard]

**Click:** [Course Registration]

**Click:** Tab: [Available Courses]

**You should see:**
```
┌─────────────────────────────────────┐
│ Available Courses                   │
├─────────────────────────────────────┤
│ CS101                               │
│ Introduction to Programming         │
│ Instructor: Ahmed Khan              │
│ Credits: 3 | Level: Undergraduate   │
│ Category: Computer Science          │
│ Students Enrolled: 0                │
│ [ENROLL] ← BUTTON                   │
└─────────────────────────────────────┘
```

✅ **SUCCESS!** Faculty's course is visible!

---

## ✍️ STEP 10: STUDENT ENROLLS IN COURSE

**On the Available Courses page:**

**Select Semester:** `Spring 2024` (dropdown selection)

**Click:** [ENROLL] button

**Result:**
```
✅ Course enrollment successful!
Going back to dashboard...
```

---

## 📖 STEP 11: VERIFY ENROLLMENT - VIEW MY COURSES

**Click:** Tab: [My Courses]

**You should see:**
```
┌──────────────────────────────────────┐
│ My Enrolled Courses                  │
├──────────────────────────────────────┤
│ CS101 - Introduction to Programming  │
│                                      │
│ Instructor: Ahmed Khan               │
│ Credits: 3                           │
│ Status: Active ✓                     │
│ Enrolled: Today at 10:30 AM          │
│ Semester: Spring 2024                │
│                                      │
│ [View Assignments]                   │
│ [View Grades]                        │
│ [View Attendance]                    │
└──────────────────────────────────────┘
```

✅ **ENROLLMENT COMPLETE!**

---

## 📊 STEP 12: VERIFY FROM FACULTY SIDE

**Logout:** Click [Logout] button top-right

**Login as Faculty:** http://localhost:3000/login
```
Email:    faculty1@university.com
Password: Faculty@123456
```

**Go to:** [Faculty Dashboard]

**Click:** [My Courses]

**You should see:**
```
┌─────────────────────────────────┐
│ My Courses                      │
├─────────────────────────────────┤
│ CS101 - Programming Basics      │
│ Created: Today                  │
│ 1 students enrolled ← UPDATED!  │
│ [Delete Course]                 │
└─────────────────────────────────┘
```

✅ **Faculty can see student enrolled!**

---

## ✅ COMPLETE WORKFLOW SUMMARY

```
✅ Admin Account Created & Approved
✅ Faculty Account Created & Approved
✅ Faculty Created Course (CS101)
✅ Student Account Created & Approved
✅ Student Viewed Available Courses
✅ Student Enrolled in CS101
✅ Enrollment Visible in "My Courses"
✅ Faculty Sees Enrollment Count
✅ Entire System Working!
```

---

## 🚀 NEXT: WHAT YOU CAN DO NOW

### Faculty Can:
- ✅ Create more courses
- ✅ Mark student attendance
- ✅ Submit student grades
- ✅ Create assignments
- ✅ View course statistics

### Student Can:
- ✅ Enroll in multiple courses
- ✅ View grades
- ✅ Check attendance
- ✅ Submit assignments
- ✅ View course deadlines

### Admin Can:
- ✅ Approve/Reject users
- ✅ View all users
- ✅ View system statistics
- ✅ Manage fees
- ✅ View login history

---

## 🆘 TROUBLESHOOTING

### Problem: "Fetching admin credentials..." never completes
**Solution:**
```sql
UPDATE users 
SET approval_status = 'approved', approved_by = 1
WHERE role = 'admin'
```

### Problem: Available Courses not showing
**Solution:** Make sure faculty created at least one course

### Problem: Cannot enroll - error message
**Check:**
1. You're logged in as student
2. You selected a semester
3. Student account is approved
4. Course exists (faculty created it)

### Problem: Course doesn't appear after enrollment
**Solution:** Click [My Courses] tab and refresh (F5)

---

## 📱 QUICK COMMANDS

**Open frontend in browser:**
```
http://localhost:3000
```

**Check backend status:**
```
http://localhost:8000
```

**View database tables:**
```
SQL Server Management Studio → university_db → Tables
```

---

## 📞 Getting Help

If you get stuck at any step:
1. Check browser console: **F12** → Console
2. Check PHP errors: Backend terminal
3. Check database: SQL Server Management Studio
4. Refresh browser: **Ctrl+F5** (hard refresh)

---

## 🎉 YOU'RE DONE!

**Your University Management System is now fully working!**

Faculty can add courses → Students can enroll → See everything on dashboards!

All features ready:
- ✅ Multi-user roles (Admin, Faculty, Student)
- ✅ Approval workflow
- ✅ Course management
- ✅ Enrollment system
- ✅ Attendance tracking
- ✅ Grade management
- ✅ Fee management
- ✅ Dashboard analytics

**Enjoy! 🚀**
