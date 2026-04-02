// Common type definitions for the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
}

export interface Student extends User {
  studentId: string;
  departmentId: string;
  enrollmentYear: number;
  gpa?: number;
}

export interface Faculty extends User {
  facultyId: string;
  departmentId: string;
  designation: string;
  specialization?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  departmentId: string;
  semester: number;
  description?: string;
  facultyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  semester: string;
  academicYear: string;
  grade?: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  PENDING = 'PENDING',
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
