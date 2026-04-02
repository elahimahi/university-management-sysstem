import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  CheckCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/admin/AdminHeader';
import { API_BASE_URL } from '../../constants/app.constants';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  pendingApprovals: number;
  totalFees: number;
  totalPayments: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    totalFees: 0,
    totalPayments: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all stats in parallel
      const [usersRes, coursesRes, pendingRes, feesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/get_users_stats.php`),
        fetch(`${API_BASE_URL}/admin/get_courses_stats.php`),
        fetch(`${API_BASE_URL}/admin/get_pending_registrations.php`),
        fetch(`${API_BASE_URL}/admin/get_fees_stats.php`),
      ]);

      // Parse all responses with flexible typing
      const usersData = usersRes.ok ? (await usersRes.json()) as any : {};
      const coursesData = coursesRes.ok ? (await coursesRes.json()) as any : {};
      const pendingData = pendingRes.ok ? (await pendingRes.json()) as any : { users: [] };
      const feesData = feesRes.ok ? (await feesRes.json()) as any : {};

      setStats({
        totalUsers: usersData?.total || usersData?.totalUsers || 0,
        totalStudents: usersData?.students || usersData?.totalStudents || 0,
        totalFaculty: usersData?.faculty || usersData?.totalFaculty || 0,
        totalCourses: coursesData?.total || coursesData?.totalCourses || 0,
        pendingApprovals: pendingData?.users?.length || pendingData?.count || 0,
        totalFees: feesData?.totalFees || feesData?.total || 0,
        totalPayments: feesData?.paidFees || feesData?.payments || 0,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color, 
    onClick 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with User Profile */}
        <AdminHeader
          title="👑 Super Admin Dashboard"
          subtitle="Welcome back! Here's your system overview."
          variant="dark"
        />

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
              <Clock className="text-purple-400" size={40} />
            </div>
            <p className="text-gray-300 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-blue-900/30 border border-blue-500/30 text-blue-100"
                onClick={() => navigate('/admin/users')}
              />
              <StatCard
                icon={Users}
                label="Students"
                value={stats.totalStudents}
                color="bg-green-900/30 border border-green-500/30 text-green-100"
                onClick={() => navigate('/admin/users')}
              />
              <StatCard
                icon={BookOpen}
                label="Faculty"
                value={stats.totalFaculty}
                color="bg-purple-900/30 border border-purple-500/30 text-purple-100"
                onClick={() => navigate('/admin/users')}
              />
              <StatCard
                icon={Clock}
                label="Pending Approvals"
                value={stats.pendingApprovals}
                color="bg-orange-900/30 border border-orange-500/30 text-orange-100"
                onClick={() => navigate('/admin/verify')}
              />
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={BookOpen}
                label="Total Courses"
                value={stats.totalCourses}
                color="bg-indigo-900/30 border border-indigo-500/30 text-indigo-100"
                onClick={() => navigate('/admin/courses')}
              />
              <StatCard
                icon={DollarSign}
                label="Total Fees"
                value={stats.totalFees}
                color="bg-emerald-900/30 border border-emerald-500/30 text-emerald-100"
                onClick={() => navigate('/admin/fees')}
              />
              <StatCard
                icon={TrendingUp}
                label="Total Payments"
                value={stats.totalPayments}
                color="bg-cyan-900/30 border border-cyan-500/30 text-cyan-100"
                onClick={() => navigate('/admin/reports')}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border border-purple-500/30 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={24} />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/admin/verify')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  👥 Review Approvals ({stats.pendingApprovals})
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  👤 Manage Users
                </button>
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  📚 Manage Courses
                </button>
                <button
                  onClick={() => navigate('/admin/fees')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  💰 Manage Fees
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 border border-slate-500/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 size={24} />
                System Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="bg-black/20 p-4 rounded">
                  <p className="text-sm opacity-75">Database Server</p>
                  <p className="text-lg font-semibold">MAHI\SQLEXPRESS</p>
                </div>
                <div className="bg-black/20 p-4 rounded">
                  <p className="text-sm opacity-75">Database Name</p>
                  <p className="text-lg font-semibold">university_db</p>
                </div>
                <div className="bg-black/20 p-4 rounded">
                  <p className="text-sm opacity-75">API Endpoint</p>
                  <p className="text-lg font-semibold">localhost:8000</p>
                </div>
                <div className="bg-black/20 p-4 rounded">
                  <p className="text-sm opacity-75">Last Updated</p>
                  <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
