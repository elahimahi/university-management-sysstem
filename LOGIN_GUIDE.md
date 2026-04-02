# How to Fix the "My Courses" Error - Step by Step

## Step 1: Log In with Faculty Account

The issue is that you need to be logged in with a valid faculty account. Follow these steps:

### Test Faculty Account Created ✅
- **Email**: `faculty_demo@university.edu`
- **Password**: `password123`

### How to Log In:

1. **Open**: http://localhost:3000/login
2. **Enter Email**: `faculty_demo@university.edu`
3. **Enter Password**: `password123`
4. **Click**: "Sign In" button
5. **Wait**: For authentication (a few seconds)
6. ✅ Should redirect to faculty dashboard

---

## Step 2: Navigate to "My Courses"

Once logged in:

1. **Look for the navigation menu** on the dashboard
2. **Find and click**: "My Courses" or "Courses" option
3. **Wait**: For courses to load (loading message will show)

---

## Step 3: What You Should See

### When "My Courses" Loads Successfully:
- ✅ A heading saying "My Courses"
- ✅ Description text about managing courses
- ✅ An "Add Course" button
- ✅ A grid showing sample courses:
  - **CS101** - Introduction to Computer Science
  - **CS201** - Data Structures  
  - **MATH101** - Calculus I

### If You See an Error Message:
- Check the error text carefully
- Common errors:
  - "Authentication required" → Please log in again
  - "Forbidden" → You might be logged in as student, need faculty account
  - "Failed to fetch" → Backend server might be down

---

## Step 4: Try Adding a New Course (Optional Test)

1. **Click**: "Add Course" button
2. **Fill in the form**:
   - Course Code: `TEST101` (must be unique)
   - Course Name: `Test Course`
   - Credits: `3`
   - Category: `Testing` (optional)
   - Level: `Undergraduate` (optional)
3. **Click**: "Add Course" button
4. ✅ Should see success message
5. ✅ New course should appear in the list

---

## Troubleshooting

### Issue: Still Getting "Authentication Required" Error

**Solution**: 
1. Log out completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close browser tab
4. Open new browser tab
5. Go to http://localhost:3000/login
6. Log in again with faculty credentials
7. Try "My Courses" again

### Issue: "Forbidden" Error

**Solution**:
You're logged in as a student, not faculty.
1. Log out
2. Log in with: `faculty_demo@university.edu` / `password123`
3. Try again

### Issue: "Courses" Not Showing in Navigation

**Solution**:
1. Wait a few seconds for page to load
2. Look for the menu icon (hamburger menu ☰)
3. Check sidebar if visible
4. Search for "courses" or "My Courses" link

### Issue: Page Shows "Loading courses..." Forever

**Solution**:
1. Press F5 to refresh the page
2. Wait 30 seconds
3. If still loading, backend might be down
4. Check if at http://localhost:3000 (app is running)

---

## Testing Checklist

- [ ] Logged in with faculty_demo@university.edu
- [ ] Able to access "My Courses" page
- [ ] Seeing the sample courses (CS101, CS201, MATH101)
- [ ] Can see the "Add Course" button
- [ ] Can add a new course successfully
- [ ] New course appears in the list
- [ ] No error messages appear

---

## Advanced Testing (Optional)

### Test as Student

**Student Account**:
- Email: `student_demo@university.edu`  
- Password: `password123`

**What to Test**:
1. Log in as student
2. Go to "Registration" (course registration page)
3. Should see available courses including those added by faculty
4. Try enrolling in a course
5. Should see it in "Your Enrolled Courses"

---

## Backend Status

The backend API is running and includes:

- ✅ **Faculty Course Management**:
  - GET `/faculty/courses` - Get faculty's courses
  - POST `/faculty/courses` - Add new course

- ✅ **Student Course Registration**:
  - GET `/courses/available` - See all courses
  - GET `/student/courses` - See enrolled courses
  - POST `/student/enroll` - Enroll in course

- ✅ **Demo Data Initialization**:
  - POST `/admin/init-demo` - Create demo users/courses

---

## Quick Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost/Database_Project/Database-main/Database-main/backend
- **API Docs**: http://localhost/Database_Project/Database-main/Database-main/backend/ (root)

---

## Still Having Issues?

1. **Check browser console** (F12 → Console tab)
2. **Look for red error messages**
3. **Check Network tab** to see API calls
4. **Verify backend is running** at `http://localhost/Database_Project/Database-main/Database-main/backend/health`

---

**Version**: 1.0
**Last Updated**: March 17, 2026
**Status**: Ready to Test ✅
