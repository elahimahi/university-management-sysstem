// Mock API data for demo purposes
export const mockUsers = {
  student: {
    id: 1,
    name: 'John Student',
    email: 'student@test.com',
    role: 'student' as const,
    department_id: 1,
    avatar_url: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  teacher: {
    id: 2,
    name: 'Dr. Sarah Teacher',
    email: 'teacher@test.com',
    role: 'teacher' as const,
    department_id: 1,
    avatar_url: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  admin: {
    id: 3,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin' as const,
    department_id: null,
    avatar_url: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
}

export const mockLoginCredentials: Record<string, string> = {
  'student@test.com': 'password123',
  'teacher@test.com': 'password123',
  'admin@test.com': 'password123',
}

export const generateMockToken = (email: string): string => {
  return `mock_token_${btoa(email)}`
}

// Mock data for departments
export const mockDepartments = [
  { id: 1, name: 'Computer Science', description: 'Department of Computer Science', head_id: 2, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Information Technology', description: 'Department of IT', head_id: 2, created_at: '2024-01-01', updated_at: '2024-01-01' },
]

// Mock data for semesters
export const mockSemesters = [
  { id: 1, name: 'Fall 2024', start_date: '2024-09-01', end_date: '2024-12-15', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, name: 'Spring 2025', start_date: '2025-01-15', end_date: '2025-05-15', is_active: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
]

// Mock data for courses
export const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Programming', description: 'Learn the basics of programming', credit_hours: 3, department_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 2, code: 'CS201', title: 'Data Structures', description: 'Study fundamental data structures', credit_hours: 3, department_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 3, code: 'IT101', title: 'IT Fundamentals', description: 'Basics of IT', credit_hours: 3, department_id: 2, created_at: '2024-01-01', updated_at: '2024-01-01' },
]

// Mock data for course offerings
export const mockOfferings = [
  { id: 1, course_id: 1, semester_id: 1, teacher_id: 2, max_seats: 30, current_seats: 25, schedule: 'Mon, Wed, Fri 10:00-11:00', location: 'Room 101', created_at: '2024-01-01', updated_at: '2024-01-01', course: mockCourses[0], teacher: mockUsers.teacher, semester: mockSemesters[0] },
  { id: 2, course_id: 2, semester_id: 1, teacher_id: 2, max_seats: 25, current_seats: 20, schedule: 'Tue, Thu 10:00-11:30', location: 'Room 202', created_at: '2024-01-01', updated_at: '2024-01-01', course: mockCourses[1], teacher: mockUsers.teacher, semester: mockSemesters[0] },
]

// Mock data for enrollments
export const mockEnrollments = [
  { id: 1, offering_id: 1, student_id: 1, enrollment_date: '2024-09-05', status: 'active' as const, created_at: '2024-01-01', updated_at: '2024-01-01', offering: mockOfferings[0], student: mockUsers.student },
  { id: 2, offering_id: 2, student_id: 1, enrollment_date: '2024-09-05', status: 'active' as const, created_at: '2024-01-01', updated_at: '2024-01-01', offering: mockOfferings[1], student: mockUsers.student },
]

// Mock data for results
export const mockResults = [
  { id: 1, enrollment_id: 1, marks_obtained: 85, total_marks: 100, grade: 'A', gpa_points: 4.0, created_at: '2024-01-01', updated_at: '2024-01-01', enrollment: mockEnrollments[0] },
  { id: 2, enrollment_id: 2, marks_obtained: 78, total_marks: 100, grade: 'B+', gpa_points: 3.7, created_at: '2024-01-01', updated_at: '2024-01-01', enrollment: mockEnrollments[1] },
]

// Mock dashboard stats
export const mockAdminStats = {
  total_students: 150,
  total_teachers: 20,
  total_courses: 45,
  active_offerings: 12,
}
