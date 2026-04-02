# Quick Startup Guide

## 🚀 Run Both Servers

### Step 1: Set Up Database (One-time only)
```bash
php backend/core/setup_database.php
```

### Step 2: Start Backend Server (Terminal 1)
```bash
cd backend
php -S localhost:8000 router.php
```

Expected output:
```
Development Server started at http://localhost:8000
```

### Step 3: Start React Development Server (Terminal 2)
```bash
npm start
```

Expected output:
```
Compiled successfully!
You can now view the app in your browser at http://localhost:3000
```

## ✅ Test Registration

1. Open http://localhost:3000 in your browser
2. Click **Register**
3. Fill in the form with:
   - First Name: Test
   - Last Name: User
   - Email: test@university.edu
   - Password: Password123!
   - Confirm Password: Password123!
4. Click **Register**
5. Should redirect to login page ✓

## 🔐 Demo Credentials

After running `php backend/admin/init_demo.php`:

**Student:**
- Email: `student_demo@university.edu`
- Password: `password123`

**Faculty:**
- Email: `faculty_demo@university.edu`
- Password: `password123`

**Admin:**
- Email: `admin_demo@university.edu`
- Password: `password123`

## 🐛 Troubleshooting

### Backend connection refused
- Make sure backend is running: `cd backend && php -S localhost:8000 router.php`
- Check port 8000 is not in use: `netstat -ano | findstr :8000`

### React not connecting to backend
- Check .env.development has: `REACT_APP_API_BASE_URL=http://localhost:8000`
- Clear browser cache and restart dev server

### Database connection failed
- Make sure MAHI\SQLEXPRESS is running
- Verify SQL Server is accessible: `php backend/core/test_connection.php`

## 📱 React DevTools

Install the Chrome extension for better debugging:
https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
