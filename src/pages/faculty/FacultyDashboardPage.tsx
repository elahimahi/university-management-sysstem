import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  BarChart3,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';

interface FacultyStats {
  totalCourses: number;
  totalStudents: number;
  pendingGrades: number;
  totalGradesSubmitted: number;
  attendanceRate: number;
  attendanceBreakdown?: {
    presentPercent: number;
    latePercent: number;
    absentPercent: number;
    total: number;
  };
}

const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<FacultyStats>({
    totalCourses: 0,
    totalStudents: 0,
    pendingGrades: 0,
    totalGradesSubmitted: 0,
    attendanceRate: 0,
    attendanceBreakdown: {
      presentPercent: 0,
      latePercent: 0,
      absentPercent: 0,
      total: 0,
    },
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
          attendanceRate: 0,
          attendanceBreakdown: {
            presentPercent: 0,
            latePercent: 0,
            absentPercent: 0,
            total: 0,
          },
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
    suffix = '',
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: number;
    color: string;
    onClick: () => void;
    suffix?: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}{suffix}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/faculty/attendance')}
                className="bg-cyan-900/30 border border-cyan-500/30 text-cyan-100 rounded-lg p-6 cursor-pointer hover:bg-cyan-900/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-sm font-semibold text-cyan-300">Attendance Rate</h3>
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-cyan-200">{Math.round(stats.attendanceRate)}%</div>
                  <p className="text-xs text-cyan-300 mt-1">Overall attendance score</p>
                </div>
                {stats.attendanceBreakdown && stats.attendanceBreakdown.total > 0 && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-900/40 border border-green-500/40 rounded p-2">
                      <div className="font-bold text-green-400">{stats.attendanceBreakdown.presentPercent}%</div>
                      <div className="text-green-300 text-xs">Present</div>
                    </div>
                    <div className="bg-yellow-900/40 border border-yellow-500/40 rounded p-2">
                      <div className="font-bold text-yellow-400">{stats.attendanceBreakdown.latePercent}%</div>
                      <div className="text-yellow-300 text-xs">Late</div>
                    </div>
                    <div className="bg-red-900/40 border border-red-500/40 rounded p-2">
                      <div className="font-bold text-red-400">{stats.attendanceBreakdown.absentPercent}%</div>
                      <div className="text-red-300 text-xs">Absent</div>
                    </div>
                  </div>
                )}
              </motion.div>
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
                  onClick={() => navigate('/faculty/grades')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  ⭐ View Grades
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
