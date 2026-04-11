import axios from 'axios';
import { getAccessToken } from '../utils/auth.utils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
instance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AttendanceRecord {
  enrollment_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface MarkAttendanceRequest {
  faculty_id: number;
  course_id: number;
  attendance_records: AttendanceRecord[];
}

export interface CourseStudent {
  enrollment_id: number;
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  semester: string;
  attendance_status: string | null;
  attendance_date: string | null;
}

export interface CourseStatistics {
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
}

class AttendanceService {
  // Faculty operations
  async getCourseStudents(
    courseId: number,
    facultyId: number,
    date: string = new Date().toISOString().split('T')[0],
    semester?: string
  ) {
    try {
      const response = await instance.get('/faculty/course-students', {
        params: {
          course_id: courseId,
          faculty_id: facultyId,
          date,
          ...(semester && { semester }),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course students:', error);
      throw error;
    }
  }

  async markAttendance(request: MarkAttendanceRequest) {
    try {
      const response = await instance.post('/faculty/mark-attendance', request);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  async getAttendanceHistory(
    courseId: number,
    facultyId: number,
    limit: number = 50
  ) {
    try {
      const response = await instance.get('/faculty/attendance-history', {
        params: {
          course_id: courseId,
          faculty_id: facultyId,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      throw error;
    }
  }

  // Student operations
  async getStudentAttendance(studentId: number) {
    try {
      const response = await instance.get('/student/attendance', {
        params: { student_id: studentId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  }

  async getAttendanceStats(studentId: number, courseId?: number) {
    try {
      const response = await instance.post('/student/attendance-stats', {
        student_id: studentId,
        ...(courseId && { course_id: courseId }),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw error;
    }
  }
}

export default new AttendanceService();
