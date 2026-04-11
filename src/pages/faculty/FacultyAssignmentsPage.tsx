import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, Users, Eye } from 'lucide-react';
import { assignmentService, CourseAssignment, AssignmentSubmission, CreateAssignmentData, GradeSubmissionData } from '../../services/assignment.service';
import { getAccessToken } from '../../utils/auth.utils';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  code: string;
  name: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const FacultyAssignmentsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [createForm, setCreateForm] = useState<CreateAssignmentData>({
    course_id: 0,
    title: '',
    description: '',
    deadline: '',
  });
  const [gradeForm, setGradeForm] = useState<GradeSubmissionData>({
    submission_id: 0,
    grade: 'good',
    feedback: '',
  });
  const [creating, setCreating] = useState(false);
  const [grading, setGrading] = useState(false);

  // Helper function to generate datetime-local format with 7 days in future
  const getDefaultDeadline = (): string => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format as datetime-local: YYYY-MM-DDTHH:mm
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const date = String(futureDate.getDate()).padStart(2, '0');
    const hours = String(futureDate.getHours()).padStart(2, '0');
    const minutes = String(futureDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${date}T${hours}:${minutes}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = getAccessToken();
      const [coursesResponse, assignmentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/faculty/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/faculty/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!coursesResponse.ok || !assignmentsResponse.ok) {
        const errorText = `Error loading data: coursesStatus=${coursesResponse.status}, assignmentsStatus=${assignmentsResponse.status}`;
        console.error(errorText);
        toast.error('Failed to load data from server.');
        return;
      }

      const coursesData = await coursesResponse.json();
      const assignmentsData = await assignmentsResponse.json();
      setCourses(coursesData.courses || []);
      setAssignments(assignmentsData.assignments || []);
    } catch (error: any) {
      console.error('Failed to load assignments page data:', error);
      toast.error(error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    console.log('Create form data:', createForm);
    
    if (!createForm.title?.trim()) {
      toast.error('Please enter assignment title');
      return;
    }
    if (!createForm.description?.trim()) {
      toast.error('Please enter assignment description');
      return;
    }
    if (!createForm.deadline) {
      toast.error('Please select a deadline');
      return;
    }
    if (!createForm.course_id || createForm.course_id === 0) {
      toast.error('Please select a course');
      return;
    }

    setCreating(true);
    try {
      console.log('Submitting assignment with data:', createForm);
      const response = await assignmentService.createAssignment(createForm);
      console.log('Assignment created response:', response);
      toast.success('Assignment created successfully');
      setCreateForm({
        course_id: 0,
        title: '',
        description: '',
        deadline: '',
      });
      setShowCreateDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Create assignment error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleViewSubmissions = async (assignment: CourseAssignment) => {
    setSelectedAssignment(assignment);
    try {
      const data = await assignmentService.getAssignmentSubmissions(assignment.id);
      setSubmissions(data);
      setShowSubmissionsDialog(true);
    } catch (error) {
      toast.error('Failed to load submissions');
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    setGrading(true);
    try {
      await assignmentService.gradeSubmission({
        submission_id: selectedSubmission.id,
        grade: gradeForm.grade,
        feedback: gradeForm.feedback,
      });
      toast.success('Submission graded successfully');
      setSelectedSubmission(null);
      setGradeForm({ submission_id: 0, grade: 'good', feedback: '' });
      if (selectedAssignment) {
        handleViewSubmissions(selectedAssignment); // Refresh submissions
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const getGradeBadge = (grade?: string) => {
    if (!grade) return null;

    const variants: Record<string, string> = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      average: 'bg-yellow-500',
      late: 'bg-red-500',
    };

    return <Badge className={variants[grade] || 'bg-gray-500'}>{grade}</Badge>;
  };

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments Management</h1>
        <Button onClick={() => {
          setCreateForm({
            course_id: 0,
            title: '',
            description: '',
            deadline: getDefaultDeadline(),
          });
          setShowCreateDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Course</label>
                <select
                  value={createForm.course_id}
                  onChange={(e) => setCreateForm({ ...createForm, course_id: parseInt(e.target.value, 10) })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>-- select course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Assignment title"
                value={createForm.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={createForm.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={4}
              />
              <Input
                type="datetime-local"
                value={createForm.deadline}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateForm({ ...createForm, deadline: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <p className="text-sm text-gray-600">
                {assignment.course_code} - {assignment.course_name}
              </p>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{assignment.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Deadline: {new Date(assignment.deadline).toLocaleString()}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handleViewSubmissions(assignment)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {assignments.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No assignments created yet
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submissions Dialog */}
      <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Submissions for: {selectedAssignment?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {submission.first_name} {submission.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={submission.status === 'late' ? 'destructive' : 'default'}>
                        {submission.status}
                      </Badge>
                      {getGradeBadge(submission.grade)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{submission.submission_text}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                  {submission.faculty_feedback && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium">Feedback:</p>
                      <p className="text-sm">{submission.faculty_feedback}</p>
                    </div>
                  )}
                  {!submission.grade && (
                    <Button
                      className="mt-2"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setGradeForm({ submission_id: submission.id, grade: 'good', feedback: '' });
                      }}
                    >
                      Grade Submission
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {submissions.length === 0 && (
              <p className="text-center text-gray-500">No submissions yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Evaluate</label>
              <select
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value as 'excellent' | 'good' | 'average' | 'late' })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="late">Late</option>
              </select>
            </div>
            <Textarea
              placeholder="Feedback (optional)"
              value={gradeForm.feedback}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Cancel
              </Button>
              <Button onClick={handleGrade} disabled={grading}>
                {grading ? 'Grading...' : 'Submit Grade'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyAssignmentsPage;