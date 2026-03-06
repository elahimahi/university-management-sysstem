// Auth
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  department_id?: number
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Department
export interface Department {
  id: number
  name: string
  description?: string
  head_id?: number
  created_at: string
  updated_at: string
}

// Course
export interface Course {
  id: number
  code: string
  title: string
  description?: string
  credit_hours: number
  department_id: number
  created_at: string
  updated_at: string
}

// Semester
export interface Semester {
  id: number
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Course Offering
export interface CourseOffering {
  id: number
  course_id: number
  semester_id: number
  teacher_id: number
  max_seats: number
  current_seats: number
  schedule?: string
  location?: string
  created_at: string
  updated_at: string
  course?: Course
  teacher?: User
  semester?: Semester
}

// Enrollment
export interface Enrollment {
  id: number
  offering_id: number
  student_id: number
  enrollment_date: string
  status: 'active' | 'completed' | 'dropped'
  created_at: string
  updated_at: string
  offering?: CourseOffering
  student?: User
}

// Result
export interface Result {
  id: number
  enrollment_id: number
  marks_obtained?: number
  total_marks: number
  grade?: string
  gpa_points?: number
  created_at: string
  updated_at: string
  enrollment?: Enrollment
}

// API Error Response
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// Pagination
export interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Query Filters
export interface StudentProfile extends User {
  roll?: string
  gpa?: number
}

// Dashboard Stats
export interface DashboardStats {
  total_students: number
  total_teachers: number
  total_courses: number
  active_offerings: number
}
