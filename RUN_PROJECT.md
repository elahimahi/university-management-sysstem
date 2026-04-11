# প্রজেক্ট চালানোর সম্পূর্ণ গাইড
# Complete Project Startup Guide

## ⚡ দ্রুত শুরু (Quick Start) - সবচেয়ে সহজ উপায়

### Option 1: একটি Command দিয়ে সবকিছু চালু করুন (Recommended)
```bash
npm run server
```
এই কমান্ড:
- ✅ Backend সার্ভার চালু করে: `http://localhost:8000`
- ✅ CORS এনাবল থাকে

তারপর **নতুন Terminal খুলুন** এবং:
```bash
npm start
```
এই কমান্ড:
- ✅ Frontend চালু করে: `http://localhost:3000`
- ✅ React DevTools সাপোর্ট করে

---

## 📋 স্টেপ বাই স্টেপ (Step by Step)

### **Step 1: প্রথম Terminal - Backend শুরু করুন**
```powershell
cd E:\3.1\sd final\university-management-sysstem
npm run server
```
**আপনি দেখবেন:**
```
PHP 8.2.12 Development Server (http://localhost:8000) started
```

### **Step 2: দ্বিতীয় Terminal - Frontend শুরু করুন**
```powershell
cd E:\3.1\sd final\university-management-sysstem
npm start
```
**আপনি দেখবেন:**
```
On Your Network: http://localhost:3000/
```

### **Step 3: ব্রাউজার খুলুন**
```
http://localhost:3000
```

---

## 🔍 যখন কাজ না করে তখন করণীয়

### ❌ Error: "Cannot GET /faculty/stats"
**সমাধান:**
```powershell
# Step 1: সমস্ত PHP প্রসেস বন্ধ করুন
taskkill /F /IM php.exe

# Step 2: Backend পুনরায় চালু করুন
npm run server
```

### ❌ Error: "CORS policy blocked"
**সমাধান:**
1. Browser Refresh করুন: `Ctrl + Shift + R` (Hard refresh)
2. Backend সার্ভার চলছে কিনা চেক করুন

### ❌ Error: "Cannot find module"
**সমাধান:**
```powershell
npm install
npm start
```

### ❌ React App blank page দেখাচ্ছে
**সমাধান:**
1. Console খুলুন: `F12`
2. দেখুন কি error আছে
3. Browser clear করুন: `Ctrl + Shift + Delete` → Clear all

---

## 🎯 সঠিক পোর্টস নিশ্চিত করুন

| Service | URL | Status |
|---------|-----|--------|
| React Frontend | http://localhost:3000 | ✅ Fixed |
| PHP Backend | http://localhost:8000 | ✅ Fixed |
| Database | localhost (MAHI\SQLEXPRESS) | ✅ Ready |

---

## 💡 টিপস (Tips)

✅ **সবসময় এই অর্ডারে চালু করুন:**
1. Backend first (`npm run server`)
2. Frontend second (`npm start`)

✅ **দ্রুত রিস্টার্ট করতে:**
```powershell
# Terminal 1: Backend থেমান
Ctrl + C

# নতুন Backend শুরু করুন
npm run server

# Terminal 2: Frontend থেমান এবং পুনরায় শুরু করুন
Ctrl + C
npm start
```

✅ **Database সিঙ্ক রাখতে:**
- Admin Dashboard চেক করুন
- কোনো error থাকলে database reset করুন

---

## 🚀 এখন সম্পূর্ণ প্রস্তুত!

দুটি Terminal এ এই দুটি কমান্ড রান করুন:

**Terminal 1:**
```bash
npm run server
```

**Terminal 2:**
```bash
npm start
```

**ব্রাউজার:**
```
http://localhost:3000
```

সবকিছু কাজ করবে! 🎉
