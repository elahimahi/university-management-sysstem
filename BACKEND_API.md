# 🔌 Backend API Documentation

Complete reference for all available API endpoints in the University Database Management System.

## 📋 Base URL
```
http://localhost:5000
```

All endpoints follow RESTful conventions and return JSON responses.

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
Login with email and password to receive authentication tokens.

**Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response (200 OK)**: 
```json
{
  "user": {
    "id": 1,
    "email": "student@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "isEmailVerified": false,
    "createdAt": "2026-03-05T10:30:00Z",
    "updatedAt": "2026-03-05T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid email or password
- `500 Server Error`: Database connection failed

---

### POST `/auth/register`
Register a new user account.

**Request Body**:
```json
{
  "email": "newuser@university.edu",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "student"
}
```

**Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 5,
    "email": "newuser@university.edu",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "student"
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Email already exists
- `500 Server Error`: Registration failed

---

## 👤 User Management Endpoints

### GET `/users/me`
Get current authenticated user's profile.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "email": "student@university.edu",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "profilePicture": null,
  "isEmailVerified": false,
  "createdAt": "2026-03-05T10:30:00Z"
}
```

---

### GET `/users/all`
Get all users in the system (Admin only).

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "email": "student@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "createdAt": "2026-03-05T10:30:00Z"
  },
  ...
]
```

---

### GET `/users/list`
Get paginated list of users.

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Results per page
- `role` (optional): Filter by role (student, faculty, admin)

**Response (200 OK)**:
```json
{
  "users": [...],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

---

## 🎓 Student Endpoints

### GET `/student/courses`
Get all courses enrolled by the current student.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "enrollmentId": 12,
    "courseCode": "CS-410",
    "courseName": "Machine Learning",
    "credits": 3,
    "semester": "Spring 2026",
    "status": "active",
    "enrolledAt": "2026-03-01T09:00:00Z"
  },
  ...
]
```

---

### GET `/student/grades`
Get grades for all enrolled courses.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "enrollmentId": 12,
    "courseCode": "CS-410",
    "courseName": "Machine Learning",
    "grade": "A",
    "gradePoint": 4.0,
    "assessmentType": "Final Exam",
    "recordedAt": "2026-03-05T14:20:00Z"
  },
  ...
]
```

---

### GET `/student/attendance`
Get attendance records for enrolled courses.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `courseId` (optional): Filter by specific course
- `semester` (optional): Filter by semester

**Response (200 OK)**:
```json
[
  {
    "enrollmentId": 12,
    "courseCode": "CS-410",
    "date": "2026-03-05",
    "status": "present",
    "recordedAt": "2026-03-05T09:30:00Z"
  },
  ...
]
```

---

### GET `/student/fees`
Get fee records and payment status.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "id": 8,
    "description": "Tuition Fee - Spring 2026",
    "amount": 2800.00,
    "dueDate": "2026-04-15",
    "status": "pending",
    "paidAmount": 0.00
  },
  ...
]
```

---

### GET `/student/deadlines`
Get upcoming assignment and exam deadlines.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "courseCode": "CS-410",
    "courseName": "Machine Learning",
    "deadline": "2026-03-20",
    "type": "Assignment",
    "title": "Project: Neural Networks",
    "daysUntilDue": 14
  },
  ...
]
```

---

### GET `/student/progress`
Get student's overall academic progress.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "studentId": 1,
  "totalCourses": 4,
  "activeCourses": 3,
  "completedCourses": 1,
  "averageGPA": 3.65,
  "totalCreditsEarned": 9,
  "totalCreditsEnrolled": 12,
  "academicStanding": "Good"
}
```

---

### GET `/student/overview`
Get complete student dashboard overview.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "student": {...},
  "stats": {...},
  "enrollments": [...],
  "grades": [...],
  "fees": [...],
  "recentActivity": [...]
}
```

---

## 👨‍🏫 Faculty Endpoints

### GET `/faculty/students`
Get list of students taught by current faculty member.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "studentId": 1,
    "name": "John Doe",
    "email": "john@university.edu",
    "coursesEnrolled": 3,
    "averageGPA": 3.75
  },
  ...
]
```

---

### GET `/faculty/stats`
Get faculty teaching statistics.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
{
  "facultyId": 2,
  "totalCourses": 3,
  "totalStudents": 85,
  "averageClassSize": 28,
  "coursesThisSemester": 2
}
```

---

### GET `/faculty/login-activity`
Get login history for faculty dashboard monitoring.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response (200 OK)**:
```json
[
  {
    "userId": 1,
    "email": "student@university.edu",
    "lastLogin": "2026-03-05T14:30:00Z",
    "loginCount": 42,
    "lastActivity": "Viewed grades"
  },
  ...
]
```

---

## 📊 Grades & Records Endpoints

### POST `/grades/add`
Add a grade for a student in a course (Faculty only).

**Headers**:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "enrollmentId": 12,
  "grade": "A",
  "gradePoint": 4.0,
  "assessmentType": "Final Exam"
}
```

**Response (201 Created)**:
```json
{
  "message": "Grade added successfully",
  "gradeId": 45
}
```

---

### GET `/records/all`
Get all academic records (Admin only).

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `studentId` (optional): Filter by student
- `semester` (optional): Filter by semester

**Response (200 OK)**:
```json
[
  {
    "enrollmentId": 12,
    "studentName": "John Doe",
    "courseCode": "CS-410",
    "semester": "Spring 2026",
    "grade": "A",
    "credits": 3
  },
  ...
]
```

---

## 🔑 Authentication Notes

- All endpoints requiring authentication need a valid `accessToken` in the `Authorization` header
- Token format: `Authorization: Bearer {token}`
- Tokens expire after 1 hour
- Invalid or expired tokens return `401 Unauthorized`

## ❌ Common Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions for the operation
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Database or server error

---

**Last Updated**: March 6, 2026  
**API Version**: 1.0.0
