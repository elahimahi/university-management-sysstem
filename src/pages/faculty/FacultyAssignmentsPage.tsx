import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, Users, Eye, BookOpen, Clock, Award, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { assignmentService, CourseAssignment, AssignmentSubmission, CreateAssignmentData, GradeSubmissionData } from '../../services/assignment.service';
import { getAccessToken } from '../../utils/auth.utils';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  code: string;
  name: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Zap className="h-12 w-12 text-blue-400" />
            </motion.div>
            <p className="text-white mt-4 text-lg">Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  const submissionCounts = assignments.reduce((acc, a) => {
    const count = submissions.filter(s => s.assignment_id === a.id).length;
    return { ...acc, [a.id]: count };
  }, {} as Record<number, number>);

  const overallStats = {
    total: assignments.length,
    graded: assignments.reduce((acc, a) => acc + submissions.filter(s => s.assignment_id === a.id && s.grade).length, 0),
    pending: assignments.reduce((acc, a) => acc + submissions.filter(s => s.assignment_id === a.id && !s.grade).length, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">
                  Assignments <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Management</span>
                </h1>
                <p className="text-blue-200">Create, manage, and grade student assignments</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCreateForm({
                    course_id: 0,
                    title: '',
                    description: '',
                    deadline: getDefaultDeadline(),
                  });
                  setShowCreateDialog(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                Create Assignment
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/30 rounded-lg p-6 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-medium">Total Assignments</p>
                    <p className="text-3xl font-bold text-white mt-2">{overallStats.total}</p>
                  </div>
                  <BookOpen className="h-10 w-10 text-blue-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/30 rounded-lg p-6 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">Graded</p>
                    <p className="text-3xl font-bold text-white mt-2">{overallStats.graded}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-400/30 rounded-lg p-6 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold text-white mt-2">{overallStats.pending}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-orange-400" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Assignments Grid */}
          <div className="space-y-4">
            <AnimatePresence>
              {assignments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-12 text-center backdrop-blur"
                >
                  <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg font-medium">No assignments created yet</p>
                  <p className="text-slate-500 text-sm mt-2">Start by creating your first assignment to get things rolling!</p>
                </motion.div>
              ) : (
                assignments.map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="group bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 hover:border-blue-500/50 rounded-xl overflow-hidden backdrop-blur transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                              {assignment.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-medium text-blue-300">
                                <BookOpen className="h-3 w-3" />
                                {assignment.course_code}
                              </span>
                              <span className="text-slate-400 text-sm">{assignment.course_name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-400">{submissions.filter(s => s.assignment_id === assignment.id).length}</p>
                            <p className="text-xs text-slate-400">Submissions</p>
                          </div>
                        </div>

                        <p className="text-slate-300 text-sm mb-6 line-clamp-2">{assignment.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock className="h-4 w-4 text-orange-400" />
                              <span className="text-sm">
                                {new Date(assignment.deadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Users className="h-4 w-4 text-blue-400" />
                              <span className="text-sm">
                                {submissions.filter(s => s.assignment_id === assignment.id && s.grade).length} graded
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewSubmissions(assignment)}
                            className="bg-gradient-to-r from-blue-500/50 to-purple-600/50 hover:from-blue-500 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300"
                          >
                            <Eye className="h-4 w-4" />
                            View Submissions
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Create Assignment Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Create New Assignment
                  </div>
                </DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Select Course</label>
                  <select
                    value={createForm.course_id}
                    onChange={(e) => setCreateForm({ ...createForm, course_id: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 hover:border-blue-500/50 focus:border-blue-500 rounded-lg text-white placeholder-slate-500 transition-colors"
                  >
                    <option value={0}>-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Assignment Title</label>
                  <Input
                    placeholder="E.g., Chapter 5 Analysis"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                  <Textarea
                    placeholder="Assignment details and instructions..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={4}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Deadline</label>
                  <Input
                    type="datetime-local"
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="bg-slate-800/50 border-slate-600/50 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateDialog(false)}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    disabled={creating}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </motion.button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Submissions Dialog */}
      <AnimatePresence>
        {showSubmissionsDialog && (
          <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 text-white max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>
                  <div className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {selectedAssignment?.title}
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                <AnimatePresence>
                  {submissions.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <Users className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">No submissions yet</p>
                    </motion.div>
                  ) : (
                    submissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-white">{submission.first_name} {submission.last_name}</p>
                            <p className="text-sm text-slate-400">{submission.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={submission.status === 'late' ? 'destructive' : 'default'} className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                              {submission.status}
                            </Badge>
                            {submission.grade && (
                              <Badge className={`
                                ${submission.grade === 'excellent' ? 'bg-green-500/20 text-green-300 border-green-400/30' : ''}
                                ${submission.grade === 'good' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : ''}
                                ${submission.grade === 'average' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' : ''}
                                ${submission.grade === 'late' ? 'bg-red-500/20 text-red-300 border-red-400/30' : ''}
                                border
                              `}>
                                {submission.grade}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-300 text-sm mb-2 bg-slate-900/50 p-3 rounded">{submission.submission_text}</p>
                        <p className="text-xs text-slate-500">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>

                        {submission.faculty_feedback && (
                          <div className="mt-3 bg-green-500/10 border border-green-500/20 p-3 rounded">
                            <p className="text-xs font-semibold text-green-300 mb-1">Your Feedback:</p>
                            <p className="text-sm text-slate-300">{submission.faculty_feedback}</p>
                          </div>
                        )}

                        {!submission.grade && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setGradeForm({ submission_id: submission.id, grade: 'good', feedback: '' });
                            }}
                            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-500/50 to-purple-600/50 hover:from-blue-500 hover:to-purple-600 text-white rounded font-medium text-sm transition-all"
                          >
                            Grade This Submission
                          </motion.button>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Grade Dialog */}
      <AnimatePresence>
        {selectedSubmission && (
          <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
            <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>
                  <div className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Grade Submission
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-1">Submission from:</p>
                  <p className="font-semibold text-white">{selectedSubmission?.first_name} {selectedSubmission?.last_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Evaluation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['excellent', 'good', 'average', 'late'].map((grade) => (
                      <motion.button
                        key={grade}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setGradeForm({ ...gradeForm, grade: grade as any })}
                        className={`py-3 px-4 rounded-lg font-medium text-sm capitalize transition-all border ${
                          gradeForm.grade === grade
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'bg-slate-800/50 border-slate-600/50 text-slate-300 hover:border-blue-500/50'
                        }`}
                      >
                        {grade === 'excellent' && <Award className="h-4 w-4 inline mr-1" />}
                        {grade}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Feedback</label>
                  <Textarea
                    placeholder="Provide constructive feedback..."
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    rows={3}
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubmission(null)}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGrade}
                    disabled={grading}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {grading ? 'Grading...' : 'Submit Grade'}
                  </motion.button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FacultyAssignmentsPage;