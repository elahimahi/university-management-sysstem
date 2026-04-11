import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertCircle, Clock, CheckCircle, XCircle, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { assignmentService, CourseAssignment } from '../../services/assignment.service';
import toast from 'react-hot-toast';

const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'overdue'>('all');

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
      const response = await assignmentService.submitAssignment({
        assignment_id: selectedAssignment.id,
        submission_text: submissionText,
      });

      const responseStatus = response?.submission_status || 'submitted';
      const submittedAt = response?.submission?.submitted_at || response?.submitted_at || new Date().toISOString();
      const wasLate = responseStatus.toString().toLowerCase() === 'late' || new Date(submittedAt) > new Date(selectedAssignment.deadline);

      if (responseStatus === 'late' || wasLate) {
        toast.success('Late submission recorded');
      } else {
        toast.success('Assignment submitted successfully');
      }

      setAssignments((prevAssignments) =>
        prevAssignments.map((assignment) =>
          assignment.id === selectedAssignment.id
            ? {
                ...assignment,
                submission_status: responseStatus,
                submission_text: submissionText,
                submitted_at: submittedAt,
                is_past_deadline: wasLate,
              }
            : assignment
        )
      );

      setSubmissionText('');
      setSelectedAssignment(null);
      loadAssignments(); // Refresh to update status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isLateSubmission = (assignment: CourseAssignment) => {
    if (assignment.submission_status?.toString().toLowerCase() === 'late') {
      return true;
    }

    if (assignment.submitted_at && assignment.deadline) {
      const submittedAt = new Date(assignment.submitted_at);
      const deadline = new Date(assignment.deadline);
      return submittedAt > deadline;
    }

    return false;
  };

  const isOverdueAssignment = (assignment: CourseAssignment) => {
    if (assignment.submission_status?.toString().toLowerCase() !== 'not_submitted') {
      return false;
    }

    const deadline = new Date(assignment.deadline).getTime();
    return Boolean(assignment.is_past_deadline) || deadline < Date.now();
  };

  const getStatusBadge = (assignment: CourseAssignment) => {
    const status = assignment.submission_status || 'not_submitted';
    const overdue = isOverdueAssignment(assignment);
    const lateSubmission = isLateSubmission(assignment);

    if (status === 'not_submitted') {
      return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${overdue ? 'bg-pink-300/40 text-pink-100 border border-pink-400/50' : 'bg-slate-700/90 text-slate-100 border border-slate-600/80'}`}>
          {overdue ? 'Overdue' : 'Not Submitted'}
        </span>
      );
    }

    if (lateSubmission) {
      return (
        <span className="inline-flex rounded-full bg-pink-300/40 px-3 py-1 text-xs font-semibold text-pink-100 border border-pink-400/50">
          Late
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-green-400/30 px-3 py-1 text-xs font-semibold text-green-100 border border-green-400/50">
        Submitted
      </span>
    );
  };

  const canSubmit = (assignment: CourseAssignment) => {
    const status = assignment.submission_status?.toString().toLowerCase() || 'not_submitted';
    return status === 'not_submitted';
  };

  const getGradeBadgeColor = (grade?: string) => {
    switch (grade) {
      case 'excellent':
        return 'bg-emerald-500';
      case 'good':
        return 'bg-cyan-500';
      case 'average':
        return 'bg-amber-500';
      case 'late':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020a1b] via-[#061432] to-[#031029] p-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#081328]/90 border border-slate-700/70 shadow-2xl shadow-[#020916]/40 p-12 max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 blur-3xl" />
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-slate-800/80 p-5 mb-6 shadow-xl shadow-cyan-500/20">
              <Sparkles className="h-12 w-12 text-cyan-300" />
            </div>
              <h2 className="text-3xl font-bold text-slate-100 mb-3">Loading assignments...</h2>
            <p className="text-sm text-slate-400">Please wait while we fetch your coursework details.</p>
          </div>
        </div>
      </div>
    );
  }

  const total = assignments.length;
  const overdue = assignments.filter((assignment) => isOverdueAssignment(assignment)).length;
  const submitted = assignments.filter((assignment) => assignment.submission_status !== 'not_submitted').length;
  const pendingAssignments = assignments.filter((assignment) => canSubmit(assignment));

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'pending') return canSubmit(assignment);
    if (filter === 'submitted') return assignment.submission_status?.toString().toLowerCase() !== 'not_submitted';
    if (filter === 'overdue') return isOverdueAssignment(assignment);
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1b] via-[#061432] to-[#031029] py-8 px-4 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-[#081328]/95 shadow-2xl shadow-[#020916]/40 backdrop-blur-xl px-6 py-8 lg:px-10 lg:py-10 max-w-7xl mx-auto">
        <div className="absolute -right-32 top-8 h-72 w-72 rounded-full bg-[#0f2e52]/10 blur-3xl" />
        <div className="absolute -left-20 bottom-12 h-64 w-64 rounded-full bg-[#0d2750]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-700/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Student Dashboard</p>
              <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight">
                My Assignments
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                View all your course assignments, submit work on time, and track grading progress with a polished student experience.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              {[
                { label: 'Total', value: total, color: 'from-slate-900 via-slate-700 to-slate-600' },
                { label: 'Submitted', value: submitted, color: 'from-slate-900 via-emerald-700 to-emerald-500' },
                { label: 'Overdue', value: overdue, color: 'from-slate-900 via-pink-700 to-pink-500' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`rounded-3xl border border-white/10 bg-gradient-to-br ${stat.color} p-4 shadow-xl shadow-slate-950/20`}
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-200/80">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'submitted', label: 'Submitted' },
              { key: 'overdue', label: 'Overdue' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === tab.key ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <AnimatePresence>
              {filteredAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="overflow-hidden border border-slate-700/60 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 shadow-2xl shadow-slate-950/40 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/20">
                    <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-900/40 to-slate-800/30 border-b border-slate-700/40">
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-900/60 to-blue-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 border border-cyan-700/60 shadow-sm shadow-cyan-500/10">
                            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                            {assignment.course_code}
                          </div>
                          <CardTitle className="mt-4 text-xl font-semibold text-slate-100">{assignment.title}</CardTitle>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{assignment.course_name}</p>
                          {assignment.subject && <p className="mt-2 text-sm text-slate-500">{assignment.subject}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(assignment)}
                          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-800/60 to-slate-700/50 px-3 py-1 text-xs text-slate-300 border border-slate-600/60 shadow-sm shadow-slate-900/20">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            {new Date(assignment.deadline).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 px-6 pb-6 pt-0">
                      <div className="rounded-2xl bg-gradient-to-r from-slate-400/10 via-cyan-400/5 to-blue-400/10 p-4 border border-cyan-400/20">
                        <p className="text-sm leading-7 text-slate-300 break-words">{assignment.description}</p>
                      </div>

                      {assignment.is_past_deadline && (
                        <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500/20 to-red-500/15 px-4 py-3 text-sm text-pink-100 border border-pink-400/40">
                          <AlertCircle className="h-4 w-4 text-pink-300" />
                          This assignment is past its deadline.
                        </div>
                      )}

                      {assignment.is_past_deadline && assignment.submission_status === 'not_submitted' && (
                        <div className="rounded-2xl border border-orange-400/40 bg-gradient-to-r from-orange-500/20 to-amber-500/15 px-4 py-3 text-sm text-orange-100">
                          Late submission is still accepted. Submit your work and it will be marked as late.
                        </div>
                      )}

                      {assignment.submission_status !== 'not_submitted' && (
                            <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/50 via-cyan-900/30 to-blue-900/20 p-5 shadow-lg shadow-cyan-500/10">
                              <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-cyan-400" />
                                  <p className="text-sm font-semibold text-cyan-100">Your submission</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isLateSubmission(assignment) ? 'bg-gradient-to-r from-pink-500/40 to-red-500/30 text-pink-100 border border-pink-400/50' : 'bg-gradient-to-r from-emerald-500/40 to-green-500/30 text-emerald-100 border border-emerald-400/50'}`}>
                                    {isLateSubmission(assignment) ? 'Late' : 'On time'}
                                  </span>
                                  {isLateSubmission(assignment) && (
                                    <span className="rounded-full bg-gradient-to-r from-pink-500/40 to-red-500/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-pink-100 border border-pink-400/50">
                                      Late
                                    </span>
                                  )}
                                </div>
                              </div>
                              {assignment.submitted_at && (
                                <p className="text-xs text-slate-400 mb-3">Submitted: {new Date(assignment.submitted_at).toLocaleString()}</p>
                              )}
                              <div className="rounded-2xl bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-4 text-sm leading-6 text-slate-200 border border-slate-700/60 whitespace-pre-wrap shadow-inner">
                                {assignment.submission_text || 'No text available'}
                              </div>
                              {assignment.grade && (
                                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/50 to-slate-800/40 p-4 shadow-inner">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-slate-200">Grade</span>
                                    <Badge className={`${getGradeBadgeColor(assignment.grade)} text-white shadow-lg shadow-${assignment.grade}-500/30`}>{assignment.grade[0].toUpperCase() + assignment.grade.slice(1)}</Badge>
                                  </div>
                                  {assignment.faculty_feedback && (
                                    <div className="rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/40 p-3 text-sm text-slate-300 border border-slate-700/50 leading-6">
                                      <p className="text-cyan-300/80 text-xs font-semibold mb-2">FEEDBACK</p>
                                      {assignment.faculty_feedback}
                                    </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {canSubmit(assignment) ? (
                          <Dialog open={selectedAssignment?.id === assignment.id} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
                            <DialogTrigger asChild>
                              <Button
                                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25 hover:from-blue-500 hover:to-blue-600`}
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setSubmissionText('');
                                }}
                              >
                                Submit
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-slate-700/60 p-6 shadow-2xl shadow-slate-950/50">
                              <DialogHeader>
                                <DialogTitle>
                                  <div className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-cyan-400" />
                                    Submit {assignment.title}
                                  </div>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/40 border border-slate-700/60 p-1 shadow-inner">
                                  <Textarea
                                    placeholder="Write your submission here..."
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    rows={6}
                                    className="bg-gradient-to-br from-slate-900/90 to-slate-950/80 text-slate-100 border-0 focus:ring-2 focus:ring-cyan-400/50 rounded-xl"
                                  />
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                  <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800/60 rounded-xl" onClick={() => setSelectedAssignment(null)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-100 shadow-lg shadow-cyan-500/20 rounded-xl"
                                    onClick={handleSubmit}
                                    disabled={submitting || !submissionText.trim()}
                                  >
                                    {submitting ? 'Submitting...' : 'Submit'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="text-sm text-slate-400">
                            {assignment.submission_status === 'not_submitted'
                              ? 'Submission unavailable'
                              : 'Submission already received'}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredAssignments.length === 0 && assignments.length > 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-700/80 bg-[#081328]/70 p-12 text-center text-slate-400">
              No assignments match the selected filter. Try switching to a different category.
            </div>
          )}

          {assignments.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-slate-700/80 bg-[#081328]/70 p-12 text-center text-slate-400">
              No assignments found. Once faculty assign coursework, it will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;