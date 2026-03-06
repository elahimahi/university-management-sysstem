import axios, { AxiosInstance, AxiosError } from 'axios'
import { mockUsers, mockLoginCredentials, generateMockToken, mockDepartments, mockOfferings, mockEnrollments, mockResults, mockAdminStats } from './api.mock'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

class ApiClient {
  private client: AxiosInstance
  private useMockApi = USE_MOCK_API

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - attach token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle 401 and fallback to mock
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        // If no connection and not already using mock API, enable it
        if (!this.useMockApi && error.code === 'ERR_NETWORK') {
          this.useMockApi = true
          console.warn('Backend not available. Switching to demo mode.')
        }
        return Promise.reject(error)
      }
    )
  }

  get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config)
  }

  post<T>(url: string, data?: unknown, config = {}) {
    return this.client.post<T>(url, data, config)
  }

  put<T>(url: string, data?: unknown, config = {}) {
    return this.client.put<T>(url, data, config)
  }

  patch<T>(url: string, data?: unknown, config = {}) {
    return this.client.patch<T>(url, data, config)
  }

  delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config)
  }

  setUseMockApi(useMock: boolean) {
    this.useMockApi = useMock
  }

  getUseMockApi() {
    return this.useMockApi
  }
}

export const apiClient = new ApiClient()
// Helper function to check if error is a network error
const isNetworkError = (error: any): boolean => {
  if (!error) return false
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') return true
  if (error.message?.includes('Network Error')) return true
  if (error.message?.includes('ERR_CONNECTION_REFUSED')) return true
  if (!error.response) return true // No response means network error
  return false
}

// Auth API
const baseAuthAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout', {}),
}

// Wrap auth API with mock fallback
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      return await baseAuthAPI.login(email, password)
    } catch (error: any) {
      // Try mock API if real API fails
      if (isNetworkError(error)) {
        const validPassword = mockLoginCredentials[email]
        if (validPassword && validPassword === password) {
          const user = Object.values(mockUsers).find(u => u.email === email)
          if (user) {
            apiClient.setUseMockApi(true)
            console.log('✅ Using demo mode for login')
            return {
              data: {
                token: generateMockToken(email),
                user: user,
              }
            }
          }
        }
        throw new Error('Invalid email or password')
      }
      throw error
    }
  },
  register: async (data: { name: string; email: string; password: string }) => {
    try {
      return await baseAuthAPI.register(data)
    } catch (error: any) {
      if (isNetworkError(error)) {
        // Allow mock registration
        apiClient.setUseMockApi(true)
        console.log('✅ Using demo mode for registration')
        const mockUser = {
          id: Date.now(),
          name: data.name,
          email: data.email,
          role: 'student' as const,
          department_id: 1,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return {
          data: {
            token: generateMockToken(data.email),
            user: mockUser,
          }
        }
      }
      throw error
    }
  },
  me: async () => {
    try {
      return await baseAuthAPI.me()
    } catch (error: any) {
      if (apiClient.getUseMockApi()) {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('user')
        if (userStr) {
          return { data: { user: JSON.parse(userStr) } }
        }
      }
      throw error
    }
  },
  logout: () => baseAuthAPI.logout(),
}

// Admin API
const baseAdminAPI = {
  getUsers: (page = 1, per_page = 15) =>
    apiClient.get(`/admin/users?page=${page}&per_page=${per_page}`),
  getDepartments: () =>
    apiClient.get('/admin/departments'),
  createDepartment: (data: { name: string; description?: string }) =>
    apiClient.post('/admin/departments', data),
  getSemesters: () =>
    apiClient.get('/admin/semesters'),
  createSemester: (data: { name: string; start_date: string; end_date: string }) =>
    apiClient.post('/admin/semesters', data),
  getAuditLogs: (page = 1) =>
    apiClient.get(`/admin/audit-logs?page=${page}`),
  getStats: () =>
    apiClient.get('/admin/stats'),
}

export const adminAPI = {
  getStats: async () => {
    try {
      return await baseAdminAPI.getStats()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockAdminStats }
      }
      throw error
    }
  },
  getDepartments: async () => {
    try {
      return await baseAdminAPI.getDepartments()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockDepartments }
      }
      throw error
    }
  },
  createDepartment: async (data: { name: string; description?: string }) => {
    try {
      return await baseAdminAPI.createDepartment(data)
    } catch (error: any) {
      if (isNetworkError(error)) {
        const newDept = { id: Date.now(), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        return { data: newDept }
      }
      throw error
    }
  },
  getUsers: (page?: number, per_page?: number) => baseAdminAPI.getUsers(page, per_page),
  getSemesters: () => baseAdminAPI.getSemesters(),
  createSemester: (data: any) => baseAdminAPI.createSemester(data),
  getAuditLogs: (page?: number) => baseAdminAPI.getAuditLogs(page),
}

// Student API
const baseStudentAPI = {
  getProfile: () =>
    apiClient.get('/students/profile'),
  updateProfile: (data: unknown) =>
    apiClient.put('/students/profile', data),
  getEnrollments: () =>
    apiClient.get('/students/enrollments'),
  getOfferings: () =>
    apiClient.get('/offerings'),
  enroll: (offering_id: number) =>
    apiClient.post(`/students/enroll/${offering_id}`, {}),
  getResults: () =>
    apiClient.get('/students/results'),
}

export const studentAPI = {
  getProfile: async () => {
    try {
      return await baseStudentAPI.getProfile()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockUsers.student }
      }
      throw error
    }
  },
  updateProfile: async (data: unknown) => {
    try {
      return await baseStudentAPI.updateProfile(data)
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: { ...mockUsers.student, ...data } }
      }
      throw error
    }
  },
  getEnrollments: async () => {
    try {
      return await baseStudentAPI.getEnrollments()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockEnrollments }
      }
      throw error
    }
  },
  getOfferings: async () => {
    try {
      return await baseStudentAPI.getOfferings()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockOfferings }
      }
      throw error
    }
  },
  enroll: async (offering_id: number) => {
    try {
      return await baseStudentAPI.enroll(offering_id)
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: { success: true, message: 'Enrolled successfully' } }
      }
      throw error
    }
  },
  getResults: async () => {
    try {
      return await baseStudentAPI.getResults()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockResults }
      }
      throw error
    }
  },
}

// Teacher API
const baseTeacherAPI = {
  getProfile: () =>
    apiClient.get('/teachers/profile'),
  getOfferings: () =>
    apiClient.get('/teachers/offerings'),
  createOffering: (data: unknown) =>
    apiClient.post('/teachers/offerings', data),
  getEnrolledStudents: (offering_id: number) =>
    apiClient.get(`/offerings/${offering_id}/enrollments`),
  submitResult: (enrollment_id: number, data: { marks: number; grade: string }) =>
    apiClient.post(`/teachers/results/${enrollment_id}`, data),
}

export const teacherAPI = {
  getProfile: async () => {
    try {
      return await baseTeacherAPI.getProfile()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockUsers.teacher }
      }
      throw error
    }
  },
  getOfferings: async () => {
    try {
      return await baseTeacherAPI.getOfferings()
    } catch (error: any) {
      if (isNetworkError(error)) {
        return { data: mockOfferings }
      }
      throw error
    }
  },
  createOffering: (data: unknown) => baseTeacherAPI.createOffering(data),
  getEnrolledStudents: (offering_id: number) => baseTeacherAPI.getEnrolledStudents(offering_id),
  submitResult: (enrollment_id: number, data: { marks: number; grade: string }) => baseTeacherAPI.submitResult(enrollment_id, data),
}

// Course API
export const courseAPI = {
  getCourses: () =>
    apiClient.get('/courses'),
  createCourse: (data: unknown) =>
    apiClient.post('/courses', data),
  updateCourse: (id: number, data: unknown) =>
    apiClient.put(`/courses/${id}`, data),
}

// Offering API
export const offeringAPI = {
  getOfferings: () =>
    apiClient.get('/offerings'),
  getOffering: (id: number) =>
    apiClient.get(`/offerings/${id}`),
  createOffering: (data: unknown) =>
    apiClient.post('/offerings', data),
}

// Department API
export const departmentAPI = {
  getDepartments: () =>
    apiClient.get('/departments'),
  getDepartment: (id: number) =>
    apiClient.get(`/departments/${id}`),
  getCoursesInDepartment: (id: number) =>
    apiClient.get(`/departments/${id}/courses`),
}
