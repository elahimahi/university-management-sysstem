import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { assignmentService, CourseAssignment } from '../../services/assignment.service';
import toast from 'react-hot-toast';

const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getStudentAssignments();
      setAssignments(data || []);
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} assignments`);
      }
    } catch (error: any) {
      console.error('[StudentAssignmentsPage] Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionText.trim()) return;

    setSubmitting(true);
    try {
      await assignmentService.submitAssignment({
        assignment_id: selectedAssignment.id,
        submission_text: submissionText,
      });
      toast.success('Assignment submitted successfully');
      setSubmissionText('');
      setSelectedAssignment(null);
      loadAssignments(); // Refresh to update status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment: CourseAssignment) => {
    if (assignment.submission_status === 'not_submitted') {
      if (assignment.is_past_deadline) {
        return <Badge variant="destructive">Overdue</Badge>;
      }
      return <Badge variant="secondary">Not Submitted</Badge>;
    }
    if (assignment.submission_status === 'submitted') {
      return <Badge variant="default" className="bg-green-500">Submitted</Badge>;
    }
    return <Badge variant="outline">Late</Badge>;
  };

  const canSubmit = (assignment: CourseAssignment) => {
    return assignment.submission_status === 'not_submitted' && !assignment.is_past_deadline;
  };

  const getGradeBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'average':
        return 'bg-yellow-500';
      case 'late':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {assignment.course_code} - {assignment.course_name}
                  </p>
                  {assignment.subject && (
                    <p className="text-sm text-gray-500">Subject: {assignment.subject}</p>
                  )}
                </div>
                {getStatusBadge(assignment)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{assignment.description}</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Deadline: {new Date(assignment.deadline).toLocaleString()}
                  </span>
                </div>
                {assignment.is_past_deadline && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Past deadline</span>
                  </div>
                )}
              </div>

              {/* Show submitted content and feedback if already submitted */}
              {assignment.submission_status !== 'not_submitted' && (
                <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Your Submission</h4>
                    <span className={`text-xs px-2 py-1 rounded text-white ${assignment.submission_status === 'late' ? 'bg-orange-500' : 'bg-green-500'}`}>
                      {assignment.submission_status === 'late' ? 'Late Submission' : 'Submitted'}
                    </span>
                  </div>

                  {assignment.submitted_at && (
                    <p className="text-xs text-gray-600">
                      Submitted: {new Date(assignment.submitted_at).toLocaleString()}
                    </p>
                  )}

                  <div className="bg-white p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.submission_text}</p>
                  </div>

                  {/* Show grade and feedback if graded */}
                  {assignment.grade && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Grade:</span>
                        <Badge className={`${getGradeBadgeColor(assignment.grade || '')} text-white`}>
                          {assignment.grade ? assignment.grade.charAt(0).toUpperCase() + assignment.grade.slice(1) : 'N/A'}
                        </Badge>
                      </div>

                      {assignment.faculty_feedback && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Faculty Feedback:</p>
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.faculty_feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {canSubmit(assignment) && (
                <Dialog open={selectedAssignment?.id === assignment.id} onOpenChange={() => setSelectedAssignment(null)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedAssignment(assignment)}>
                      Submit Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Assignment: {assignment.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Enter your submission..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        rows={6}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={submitting || !submissionText.trim()}
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}

        {assignments.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No assignments found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;