import { z } from 'zod';

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * User registration validation schema
 */
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Student form validation schema
 */
export const studentSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  studentId: z.string().min(3, 'Student ID is required'),
  departmentId: z.string().min(1, 'Department is required'),
  enrollmentYear: z.number().min(2000).max(new Date().getFullYear()),
});

export type StudentFormData = z.infer<typeof studentSchema>;

/**
 * Course form validation schema
 */
export const courseSchema = z.object({
  courseCode: z.string().min(3, 'Course code is required'),
  courseName: z.string().min(3, 'Course name is required'),
  credits: z.number().min(1).max(6, 'Credits must be between 1 and 6'),
  departmentId: z.string().min(1, 'Department is required'),
  semester: z.number().min(1).max(8, 'Semester must be between 1 and 8'),
  description: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;
