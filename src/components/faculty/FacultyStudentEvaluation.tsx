import React, { useState, useEffect } from 'react';
import { Users, Star, MessageSquare, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_id: number;
  course_name?: string;
  status: string;
  submissions_count: number;
  avg_rating: number | null;
}

interface Assignment {
  id: number;
  title: string;
  submission_text: string;
  self_rating: number;
  faculty_rating: number | null;
  submitted_at: string;
  enrolled_id?: number;
}

const FacultyStudentEvaluation: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSubmissions, setStudentSubmissions] = useState<Assignment[]>([]);
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [evaluationRating, setEvaluationRating] = useState(3);
  const [evaluationFeedback, setEvaluationFeedback] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/faculty/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(response.data.students || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentSubmissions(student.enrollment_id);
  };

  const fetchStudentSubmissions = async (enrollmentId: number) => {
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/student/progress?enrollment_id=${enrollmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // This would need to be updated in the backend to support filtering by enrollment_id
      setStudentSubmissions(response.data.submissions || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  const submitEvaluation = async (assignmentId: number) => {
    setSubmittingEvaluation(true);
    try {
      const token = getAccessToken();
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/faculty/students`,
        {
          assignment_id: assignmentId,
          faculty_rating: evaluationRating,
          feedback: evaluationFeedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEvaluatingId(null);
      setEvaluationRating(3);
      setEvaluationFeedback('');
      
      if (selectedStudent) {
        fetchStudentSubmissions(selectedStudent.enrollment_id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading students...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Students List */}
      <div className="lg:col-span-1">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users size={20} /> Your Students ({students.length})
          </h3>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {students.map((student) => (
              <button
                key={`${student.id}-${student.enrollment_id}`}
                onClick={() => selectStudent(student)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedStudent?.id === student.id
                    ? 'bg-[#FFB347]/20 border border-[#FFB347]/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <p className="font-semibold text-sm">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-xs text-gray-400">{student.email}</p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {student.submissions_count} submissions
                  </span>
                  {student.avg_rating && (
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      Avg: {student.avg_rating.toFixed(1)}/5
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student Submissions & Evaluation */}
      <div className="lg:col-span-2">
        {selectedStudent ? (
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">
              {selectedStudent.first_name} {selectedStudent.last_name} - Submissions
            </h3>

            {studentSubmissions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {studentSubmissions.map((submission) => (
                  <div
                    key={`${submission.id}-${new Date(submission.submitted_at).getTime()}`}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{submission.title}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#FFB347]">Self: {submission.self_rating}/5</p>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{submission.submission_text}</p>

                    {submission.faculty_rating ? (
                      <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg mb-4">
                        <p className="text-sm font-semibold text-green-300 mb-1">Your Evaluation:</p>
                        <p className="text-sm text-gray-300">{submission.faculty_rating}/5 stars</p>
                      </div>
                    ) : evaluatingId === submission.id ? (
                      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setEvaluationRating(rating)}
                                className={`w-8 h-8 rounded font-bold transition-all ${
                                  evaluationRating === rating
                                    ? 'bg-[#FFB347] text-[#050b18]'
                                    : 'bg-white/10 text-white'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Feedback</label>
                          <textarea
                            value={evaluationFeedback}
                            onChange={(e) => setEvaluationFeedback(e.target.value)}
                            placeholder="Provide constructive feedback..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:border-[#FFB347] outline-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => submitEvaluation(submission.id)}
                            disabled={submittingEvaluation}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Send size={16} />
                            {submittingEvaluation ? 'Sending...' : 'Submit Evaluation'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEvaluatingId(null)}
                            className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEvaluatingId(submission.id)}
                        className="w-full py-2 bg-[#FFB347]/20 hover:bg-[#FFB347]/30 text-[#FFB347] rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <MessageSquare size={16} />
                        Evaluate Student
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
            <p className="text-gray-400">Select a student to view their submissions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyStudentEvaluation;
