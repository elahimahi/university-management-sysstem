import { apiService } from './api.service';

export interface CourseAssignment {
  id: number;
  course_id: number;
  title: string;
  subject?: string;
  description: string;
  deadline: string;
  created_by: number;
  created_at: string;
  course_code: string;
  course_name: string;
  is_past_deadline: boolean | number;
  submission_status: string;
  submission_id?: number;
  submission_text?: string;
  submitted_at?: string;
  grade?: string;
  faculty_feedback?: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  submission_text: string;
  submitted_at: string;
  status: 'submitted' | 'late';
  faculty_feedback?: string;
  grade?: 'excellent' | 'good' | 'average' | 'late';
  evaluated_at?: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CreateAssignmentData {
  course_id: number;
  title: string;
  description: string;
  deadline: string;
}

export interface SubmitAssignmentData {
  assignment_id: number;
  submission_text: string;
}

export interface GradeSubmissionData {
  submission_id: number;
  grade: 'excellent' | 'good' | 'average' | 'late';
  feedback?: string;
}

class AssignmentService {
  // Student methods
  async getStudentAssignments(): Promise<CourseAssignment[]> {
    const response = await apiService.get('/student/assignments') as any;
    return response.assignments || [];
  }

  async submitAssignment(data: SubmitAssignmentData): Promise<any> {
    const response = await apiService.post('/student/submit-assignment', data) as any;
    return response;
  }

  // Faculty methods
  async createAssignment(data: CreateAssignmentData): Promise<any> {
    const response = await apiService.post('/faculty/assignments', data) as any;
    return response;
  }

  async getAssignmentSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    const response = await apiService.get(`/faculty/assignment-submissions?assignment_id=${assignmentId}`) as any;
    return response.submissions || [];
  }

  async gradeSubmission(data: GradeSubmissionData): Promise<any> {
    const response = await apiService.post('/faculty/grade-submission', data) as any;
    return response;
  }
}

export const assignmentService = new AssignmentService();