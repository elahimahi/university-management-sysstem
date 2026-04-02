import React, { useState, useEffect } from 'react';
import { Eye, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';

interface Submission {
  id: number;
  title: string;
  course_name: string;
  self_rating: number;
  faculty_rating: number | null;
  faculty_feedback: string;
  submitted_at: string;
  evaluated_at: string | null;
}

const StudentSubmissionHistory: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/student/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissions(response.data.submissions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
        <p className="text-gray-400">No submissions yet. Submit your progress to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Your Submissions & Feedback</h3>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="glass-panel p-4 rounded-xl border border-white/10 hover:border-[#FFB347]/30 transition-all cursor-pointer"
            onClick={() => setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2">
                  {submission.title}
                  {submission.faculty_rating && <CheckCircle size={16} className="text-green-400" />}
                </h4>
                <p className="text-sm text-gray-400">{submission.course_name}</p>
              </div>

              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-xs text-gray-500">Your Rating</p>
                  <p className="text-lg font-bold text-[#FFB347]">{submission.self_rating}/5</p>
                </div>

                {submission.faculty_rating && (
                  <div>
                    <p className="text-xs text-gray-500">Faculty Rating</p>
                    <p className="text-lg font-bold text-green-400">{submission.faculty_rating}/5</p>
                  </div>
                )}

                {!submission.faculty_rating && (
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm text-blue-400">Pending Review</p>
                  </div>
                )}
              </div>
            </div>

            {selectedSubmission?.id === submission.id && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                {submission.faculty_feedback && (
                  <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-green-400 mb-1">Faculty Feedback:</p>
                    <p className="text-sm text-gray-300">{submission.faculty_feedback}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                  {submission.evaluated_at && ` • Evaluated: ${new Date(submission.evaluated_at).toLocaleDateString()}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSubmissionHistory;
