import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, CheckCircle, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';

interface Student {
  id: number;
  name: string;
  email: string;
  student_id: string;
  enrollment_status: string;
  course_count: number;
}

const FacultyStudentsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchMyStudents();
    }
  }, [user]);

  const fetchMyStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/faculty/get_my_students.php?faculty_id=${user?.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Network error while fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">👥 My Students</h1>
          <p className="text-purple-200">View all your enrolled students across courses</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Students Section */}
        {loading ? (
          <div className="text-center py-12 text-gray-300">
            <div className="inline-block animate-spin">
              <Users size={40} className="text-purple-400" />
            </div>
            <p className="mt-4">Loading students...</p>
          </div>
        ) : (
          <>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>
                  {students.length === 0
                    ? 'No students enrolled yet'
                    : 'No students match your search'}
                </p>
              </div>
            ) : (
              <>
                {/* Table View */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-700/50 border-b border-slate-600 font-semibold text-gray-300">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Student ID</div>
                    <div>Status</div>
                    <div>Courses</div>
                    <div>Actions</div>
                  </div>

                  <div className="divide-y divide-slate-600">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 items-center hover:bg-slate-700/30 transition-colors"
                      >
                        <div>
                          <p className="text-white font-semibold">{student.name}</p>
                          <p className="text-gray-400 text-sm">{student.email}</p>
                        </div>
                        <div className="text-gray-300">{student.email}</div>
                        <div className="text-gray-300">{student.student_id}</div>
                        <div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-300 border border-green-500/30">
                            {student.enrollment_status}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-900/30 text-blue-300">
                            {student.course_count}
                          </span>
                        </div>
                        <div>
                          <button className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                            View <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-purple-400">{students.length}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Search Results</p>
                    <p className="text-3xl font-bold text-blue-400">{filteredStudents.length}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Active Students</p>
                    <p className="text-3xl font-bold text-green-400">
                      {students.filter(s => s.enrollment_status === 'active').length}
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FacultyStudentsManagementPage;
