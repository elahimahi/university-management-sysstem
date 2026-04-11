import React, { useState } from 'react';
import { Upload, Send, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';

interface StudentProgressProps {
  enrollmentId: number;
  courseName: string;
  onSubmitSuccess?: () => void;
}

const StudentProgressSubmit: React.FC<StudentProgressProps> = ({
  enrollmentId,
  courseName,
  onSubmitSuccess,
}) => {
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const token = getAccessToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/student/progress`,
        {
          enrollment_id: enrollmentId,
          assignment_title: assignmentTitle,
          submission_text: submissionText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: 'success', text: 'Progress submitted successfully!' });
      setAssignmentTitle('');
      setSubmissionText('');
      onSubmitSuccess?.();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit progress',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Upload size={20} /> Submit Progress - {courseName}
      </h3>

      {message && (
        <div
          className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Assignment Title</label>
          <input
            type="text"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            placeholder="e.g., Lab 1 Submission, Quiz Attempt"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-400 focus:border-[#FFB347] outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Submission Details</label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Describe your progress, what you learned, challenges faced..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-400 focus:border-[#FFB347] outline-none transition-all resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#FFB347] hover:bg-[#ffc266] text-[#050b18] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={18} />
          {isSubmitting ? 'Submitting...' : 'Submit Progress'}
        </button>
      </form>
    </div>
  );
};

export default StudentProgressSubmit;
