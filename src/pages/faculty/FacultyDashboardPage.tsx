import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  BarChart3,
  PlusCircle,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';

interface FacultyStats {
  totalCourses: number;
  totalStudents: number;
  pendingGrades: number;
  totalGradesSubmitted: number;
}

const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<FacultyStats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    totalGradesSubmitted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchFacultyStats();
    }
  }, [user]);

  const fetchFacultyStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/faculty/get_stats.php?faculty_id=${user?.id}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats || {
          totalCourses: 0,
          totalStudents: 0,
          pendingGrades: 0,
          totalGradesSubmitted: 0,
        });
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching faculty stats:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    onClick,
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: number;
    color: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="opacity-30" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            👨‍🏫 Faculty Dashboard
          </h1>
          <p className="text-blue-200">
            Welcome, {user?.firstName}! Manage your courses and students here.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <BookOpen className="text-blue-400" size={40} />
            </div>
            <p className="text-gray-300 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={BookOpen}
                label="My Courses"
                value={stats.totalCourses}
                color="bg-blue-900/30 border border-blue-500/30 text-blue-100"
                onClick={() => navigate('/faculty/my-courses')}
              />
              <StatCard
                icon={Users}
                label="My Students"
                value={stats.totalStudents}
                color="bg-purple-900/30 border border-purple-500/30 text-purple-100"
                onClick={() => navigate('/faculty/my-students')}
              />
              <StatCard
                icon={ClipboardList}
                label="Pending Grades"
                value={stats.pendingGrades}
                color="bg-orange-900/30 border border-orange-500/30 text-orange-100"
                onClick={() => navigate('/faculty/grades')}
              />
              <StatCard
                icon={BarChart3}
                label="Grades Submitted"
                value={stats.totalGradesSubmitted}
                color="bg-green-900/30 border border-green-500/30 text-green-100"
                onClick={() => navigate('/faculty/grades')}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 border border-blue-500/30 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle size={24} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/faculty/my-courses')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  📚 My Courses ({stats.totalCourses})
                </button>
                <button
                  onClick={() => navigate('/faculty/my-students')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  👥 My Students ({stats.totalStudents})
                </button>
                <button
                  onClick={() => navigate('/faculty/attendance')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  📋 Mark Attendance
                </button>
                <button
                  onClick={() => navigate('/faculty/submit-grades')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  ⭐ Submit Grades
                </button>
                <button
                  onClick={() => navigate('/faculty/assignments')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  📝 Manage Assignments
                </button>
                <button
                  onClick={() => navigate('/faculty/reports')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  📊 View Reports
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-4">👤 Profile Information</h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <p className="text-sm opacity-75">Name</p>
                    <p className="text-lg font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Email</p>
                    <p className="text-lg font-semibold text-white">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Role</p>
                    <p className="text-lg font-semibold text-blue-300 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-8">
                <h3 className="text-xl font-bold text-white mb-4">✅ System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-sm opacity-75">Backend API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-sm opacity-75">Database</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-sm opacity-75">Authentication</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboardPage;
