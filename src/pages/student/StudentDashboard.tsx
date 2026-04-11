import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Bell,
  LogOut,
  BookOpen,
  Clock,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import Navbar from '../../components/ui/Navbar';
import Sidebar from '../../components/ui/Sidebar';

// Countdown Timer Component
const CountdownTimer: React.FC<{ deadline: string; secondsUntil: number }> = ({
  deadline,
  secondsUntil,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const difference = deadlineDate.getTime() - now.getTime();
  const isUrgent = difference < 24 * 60 * 60 * 1000; // Less than 24 hours
  const isExpired = difference <= 0;

  return (
    <div
      className={`text-center font-bold text-lg ${
        isExpired ? 'text-red-600' : isUrgent ? 'text-orange-400 animate-pulse' : 'text-blue-400'
      }`}
    >
      {timeLeft}
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latestNotification, setLatestNotification] = useState<{
    id: number;
    message: string;
    status: string;
  } | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStudentData = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setIsRefreshing(true);
      }
      const token = getAccessToken();
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        'http://localhost/SD_Project/university-management-sysstem/backend';
      const statsResponse = await axios.get(`${API_BASE_URL}/student/student_stats.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentId = user?.id ?? null;
      let feesStructure = statsResponse.data?.fees?.structure ?? [];
      let upcomingDeadlines = [];

      if (studentId) {
        try {
          const feesResponse = await axios.post(
            `${API_BASE_URL}/student/fees`,
            { student_id: studentId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const rawFees = feesResponse.data?.fees ?? [];
          const pendingFees = rawFees
            .map((fee: any) => ({
              ...fee,
              amount: Number(fee.amount ?? 0),
              remaining_amount: Number(fee.remaining_amount ?? fee.amount ?? 0),
            }))
            .filter((fee: any) => Number(fee.remaining_amount) > 0);

          if (pendingFees.length > 0) {
            feesStructure = pendingFees;
          }
        } catch (feesError) {
          console.warn('Could not load student fees for dashboard pending card', feesError);
        }

        // Fetch assignments and upcoming deadlines
        try {
          const assignmentsResponse = await axios.get(`${API_BASE_URL}/student/assignments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const assignments = assignmentsResponse.data?.assignments || [];
          
          console.log('[Dashboard] Fetched assignments:', assignments);
          
          // Show only future unsubmitted assignments sorted by deadline
          const now = Date.now();
          upcomingDeadlines = assignments
            .filter((assignment: any) => {
              const deadlineTimestamp = new Date(assignment.deadline).getTime();
              return assignment.submission_status === 'not_submitted' && deadlineTimestamp > now;
            })
            .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 8) // Show only top 8 upcoming assignments
            .map((assignment: any) => {
              const deadline = new Date(assignment.deadline);
              const secondsUntil = Math.floor((deadline.getTime() - now) / 1000);
              
              return {
                title: assignment.title,
                course: assignment.course_code,
                type: 'Assignment',
                date: deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                time: deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                deadline: assignment.deadline,
                seconds_until: secondsUntil,
              };
            });
          
          console.log('[Dashboard] Upcoming deadlines:', upcomingDeadlines);
        } catch (assignmentError) {
          console.warn('Could not load assignments for dashboard', assignmentError);
        }
      }

      setData({
        ...statsResponse.data,
        fees: {
          ...statsResponse.data?.fees,
          structure: feesStructure,
        },
        deadlines: upcomingDeadlines,
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (error: any) {
      console.error('Error fetching student data:', error);
      if (!isSilent) {
        setError(error.response?.data?.message || 'Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchLatestNotification = async () => {
    try {
      const token = getAccessToken();
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        'http://localhost/SD_Project/university-management-sysstem/backend';
      const response = await axios.get(`${API_BASE_URL}/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifications = response.data.notifications || [];
      setLatestNotification(notifications[0] ?? null);
    } catch (error) {
      console.error('Error fetching latest notification:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStudentData(true);
    fetchLatestNotification();

    // Set up polling interval - refresh every 15 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchStudentData(true);
      fetchLatestNotification();
    }, 15000); // 15 seconds

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const menuItems = [
    { label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/student/dashboard' },
    { label: 'Registration', icon: <BookOpen size={20} />, href: '/student/registration' },
    { label: 'Grades', icon: <CheckSquare size={20} />, href: '/student/grades' },
    { label: 'Attendance', icon: <Clock size={20} />, href: '/student/attendance' },
    { label: 'Assignments', icon: <BookOpen size={20} />, href: '/student/assignments' },
    { label: 'Fees', icon: <CreditCard size={20} />, href: '/student/fees' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  const gpaValue = parseFloat(data?.stats?.gpa || '0');
  const gpaData = [{ name: 'GPA', value: gpaValue, fill: '#FFB347' }];

  if (error) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b18] via-[#0a1428] to-[#0f1a2e] text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
      <Navbar
        items={[]}
        rightContent={
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/notifications')}
              className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden md:flex flex-col gap-1 max-w-[320px]">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Latest notification
              </p>
              <p className="text-sm text-slate-100 truncate">
                {latestNotification?.message || 'No new notifications'}
              </p>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            </div>
          </div>
        }
      />

      <div className="flex pt-16">
        <Sidebar
          items={menuItems}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main
          className={`flex-1 transition-all duration-300 p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  Welcome Back, <span className="text-blue-400">{user?.firstName}</span>
                </motion.h1>
                <div className="flex items-center gap-4">
                  <p className="text-gray-400 flex items-center gap-2">
                    <Calendar size={16} />{' '}
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {lastUpdated && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}
                      ></span>
                      {isRefreshing
                        ? 'Updating...'
                        : `Updated ${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchStudentData(false)}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </header>

            {/* Quick Stats - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* GPA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-500/0 group-hover:from-amber-400/10 group-hover:to-amber-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-amber-300 font-bold uppercase tracking-widest">Current GPA</p>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      📊
                    </div>
                  </div>
                  <h3 className="text-4xl font-black text-amber-300 mb-2">{data?.stats?.gpa || '0.00'}</h3>
                  <p className="text-xs text-amber-200/70">Performance Target: 4.0</p>
                  <div className="mt-4 pt-4 border-t border-amber-500/20">
                    <span className="text-sm font-bold text-green-400 flex items-center gap-1">+0.04 ▲ this semester</span>
                  </div>
                </div>
              </motion.div>

              {/* Credits Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-500/0 group-hover:from-blue-400/10 group-hover:to-blue-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mb-4">Credits Progress</p>
                  <div className="space-y-4">
                    <div className="flex items-end gap-3">
                      <div>
                        <p className="text-xs text-blue-200/70 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-green-400">{data?.stats?.completedCredits || 0}</p>
                      </div>
                      <div className="flex-1 h-1 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
                    </div>
                    <div className="flex items-end gap-3">
                      <div>
                        <p className="text-xs text-blue-200/70 mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-blue-400">{data?.stats?.inProgressCredits || 0}</p>
                      </div>
                      <div className="flex-1 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                    </div>
                    <div className="pt-3 border-t border-blue-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-200/70">Total Progress</span>
                        <span className="text-lg font-black text-blue-300">{Math.round(((data?.stats?.completedCredits || 0) / 140) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Attendance Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-500/0 group-hover:from-green-400/10 group-hover:to-green-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-green-300 font-bold uppercase tracking-widest">Attendance</p>
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                      ✓
                    </div>
                  </div>
                  <h3 className="text-4xl font-black text-green-300 mb-2">{data?.stats?.attendance || '0%'}</h3>
                  <p className="text-xs text-green-200/70">Above Class Average</p>
                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${parseInt(data?.stats?.attendance || '0')}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* GPA & Analytics - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-red-600/5 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div className="absolute -inset-full bg-gradient-to-r from-amber-500/0 via-amber-400/5 to-amber-500/0 group-hover:from-amber-500/10 group-hover:via-amber-400/20 group-hover:to-amber-500/10 transition-all duration-500 group-hover:animate-pulse"></div>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-amber-300 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    📈
                  </div>
                  Semester Performance
                </h3>
                <div className="flex items-center justify-around h-48 relative z-10">
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        data={gpaData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar dataKey="value" cornerRadius={10} maxBarSize={15} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-black text-3xl text-amber-300">{data?.stats?.gpa || '0.00'}</p>
                        <p className="text-xs text-amber-200/60 uppercase tracking-wider">GPA</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500"></div>
                      <div>
                        <p className="text-xs text-amber-200/60 uppercase tracking-wider">Current</p>
                        <p className="text-sm font-bold text-amber-300">Your Performance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600"></div>
                      <div>
                        <p className="text-xs text-amber-200/60 uppercase tracking-wider">Target</p>
                        <p className="text-sm font-bold text-blue-300">4.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Attendance Trend - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-500/15 via-cyan-600/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="absolute -inset-full bg-gradient-to-r from-blue-500/0 via-blue-400/5 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-400/20 group-hover:to-blue-500/10 transition-all duration-500 group-hover:animate-pulse"></div>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-blue-300 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    📊
                  </div>
                  Attendance Trends
                </h3>
                <div className="h-48 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.attendanceTrends}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#ffffff08" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" hide />
                      <Tooltip
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '2px solid #60a5fa', borderRadius: '12px', boxShadow: '0 8px 16px rgba(96, 165, 250, 0.2)' }}
                        labelStyle={{ color: '#93c5fd' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#082f49' }}
                        activeDot={{ r: 7, fill: '#00d4ff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Courses - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-500/15 via-indigo-600/10 to-purple-600/5 border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300"
              >
                <h3 className="text-2xl font-bold mb-8 text-blue-300 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    📚
                  </div>
                  Enrolled Courses
                </h3>

                {/* Active Courses */}
                {data?.currentCourses &&
                  data?.currentCourses.some((c: any) => c.status === 'active') && (
                    <div className="mb-8">
                      <p className="text-xs font-bold text-blue-200/70 uppercase tracking-widest mb-4">
                        Currently Active
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.currentCourses
                          ?.filter((c: any) => c.status === 'active')
                          .map((course: any, idx: number) => (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + idx * 0.05 }}
                              className="group/course relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/30 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-500/0 group-hover/course:from-blue-400/5 group-hover/course:to-blue-500/5 transition-all"></div>
                              <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/30 to-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-sm group-hover/course:scale-110 transition-transform">
                                    {course.code.split('-')[0]}
                                  </div>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 font-bold uppercase tracking-wider">
                                    {course.credits}cr
                                  </span>
                                </div>
                                <h4 className="font-bold mb-1 text-sm text-white line-clamp-2">{course.title}</h4>
                                <p className="text-xs text-blue-200/60 mb-3">
                                  {course.code} • Prof. {course.instructor}
                                </p>
                                {course.latest_grade && (
                                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-400/20 text-center">
                                    <p className="text-[10px] text-blue-200/60 uppercase tracking-wider font-bold mb-1">
                                      Current Grade
                                    </p>
                                    <p className="text-lg font-black text-blue-200">
                                      {course.latest_grade}
                                      <span className="text-xs text-blue-300/70 ml-1">
                                        ({parseFloat(course.latest_grade_point || 0).toFixed(2)})
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Completed Courses */}
                {data?.currentCourses &&
                  data?.currentCourses.some((c: any) => c.status === 'completed') && (
                    <div>
                      <p className="text-xs font-bold text-green-200/70 uppercase tracking-widest mb-4">
                        ✓ Completed
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.currentCourses
                          ?.filter((c: any) => c.status === 'completed')
                          .map((course: any, idx: number) => (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + idx * 0.05 }}
                              className="group/course relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/30 hover:border-green-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
                            >
                              <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/30 to-green-500/20 flex items-center justify-center text-green-300 font-bold group-hover/course:scale-110 transition-transform">
                                    ✓
                                  </div>
                                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/30 text-green-200 font-bold uppercase tracking-wider">
                                    {course.credits}cr ✓
                                  </span>
                                </div>
                                <h4 className="font-bold mb-1 text-sm text-white line-clamp-2">{course.title}</h4>
                                <p className="text-xs text-green-200/60 mb-3">
                                  {course.code} • Prof. {course.instructor}
                                </p>
                                {course.latest_grade && (
                                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-400/20 text-center">
                                    <p className="text-[10px] text-green-200/60 uppercase tracking-wider font-bold mb-1">
                                      Final Grade
                                    </p>
                                    <p className="text-lg font-black text-green-200">
                                      {course.latest_grade}
                                      <span className="text-xs text-green-300/70 ml-1">
                                        ({parseFloat(course.latest_grade_point || 0).toFixed(2)})
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                {(!data?.currentCourses || data?.currentCourses.length === 0) && (
                  <div className="col-span-2 text-center py-12">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-gray-400">No courses enrolled yet</p>
                  </div>
                )}
              </motion.div>

              {/* Fees - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group overflow-hidden rounded-3xl p-8 bg-slate-950/90 border border-amber-400/20 shadow-2xl shadow-amber-500/10 hover:border-amber-300/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-3xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Pending Fees</h3>
                      <p className="text-sm text-amber-200/70">Keep your account in good standing</p>
                    </div>
                  </div>
                  {data?.fees?.structure && data?.fees?.structure.length > 0 && (
                    <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                      Due Soon
                    </span>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  {data?.fees?.structure && data?.fees?.structure.length > 0 ? (
                    <>
                      <div className="rounded-3xl border border-amber-400/15 bg-slate-900/95 p-6 shadow-sm shadow-amber-500/10">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/60">Total pending</p>
                            <p className="mt-3 text-4xl font-extrabold text-white">
                              ৳{data.fees.structure.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-3xl bg-amber-500/10 px-4 py-3 text-right text-sm font-semibold text-amber-200">
                            Pay Now
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {data.fees.structure.map((fee: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className="rounded-2xl border border-amber-500/10 bg-slate-900/90 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-amber-200">৳{fee.amount?.toLocaleString()}</p>
                                <p className="text-xs text-amber-200/50">{fee.label || 'Pending payment'}</p>
                              </div>
                              <p className="text-lg font-black text-amber-300">Due soon</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-3xl border border-emerald-400/20 bg-slate-900/90 p-8 text-center"
                    >
                      <p className="text-4xl mb-3 text-green-300">✓</p>
                      <p className="text-2xl font-semibold text-white">All fees paid!</p>
                      <p className="mt-2 text-sm text-emerald-200/70">Great, you're all set 🎉</p>
                    </motion.div>
                  )}
                </div>

                {data?.fees?.structure && data?.fees?.structure.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/student/fees?open=pending')}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-center font-bold text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:brightness-110"
                  >
                    Pay Now
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Completed Courses Summary - Enhanced */}
            {data?.currentCourses &&
              data?.currentCourses.some((c: any) => c.status === 'completed') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/40 hover:border-emerald-400/70 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/15"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-green-500/0 group-hover:from-emerald-400/10 group-hover:to-green-500/10 transition-all"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-emerald-300">Courses Completed</h3>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-green-500/20 flex items-center justify-center text-2xl group-hover:scale-125 transition-transform">
                        ✓
                      </div>
                    </div>
                    <div className="text-5xl font-black text-emerald-200 mb-3">
                      {data?.currentCourses?.filter((c: any) => c.status === 'completed').length || 0}
                    </div>
                    <p className="text-sm text-emerald-200/70">
                      {data?.stats?.completedCredits || 0} credits earned
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/40 hover:border-blue-400/70 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/15"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-500/0 group-hover:from-blue-400/10 group-hover:to-cyan-500/10 transition-all"></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-blue-300">In Progress</h3>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/30 to-cyan-500/20 flex items-center justify-center text-2xl group-hover:scale-125 transition-transform">
                        📚
                      </div>
                    </div>
                    <div className="text-5xl font-black text-blue-200 mb-3">
                      {data?.currentCourses?.filter((c: any) => c.status === 'active').length || 0}
                    </div>
                    <p className="text-sm text-blue-200/70">
                      {data?.stats?.inProgressCredits || 0} credits in progress
                    </p>
                  </motion.div>
                </motion.div>
              )}

            {/* Upcoming Deadlines - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-red-500/15 via-orange-600/10 to-red-600/5 border border-red-500/20 hover:border-red-400/50 transition-all duration-300 mb-8"
            >
              <div className="absolute -inset-full bg-gradient-to-r from-red-500/0 via-red-400/5 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-400/20 group-hover:to-red-500/10 transition-all duration-500"></div>
              
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-red-300 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center animate-pulse">
                  ⏰
                </div>
                Upcoming Deadlines
              </h3>

              {data?.deadlines && data?.deadlines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {data?.deadlines?.map((deadline: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group/deadline relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-red-500/15 to-orange-500/10 border border-red-400/30 hover:border-red-300/60 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-orange-400/0 group-hover/deadline:from-red-400/5 group-hover/deadline:to-orange-400/5 transition-all"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs text-red-300 font-black uppercase tracking-widest">
                              {deadline.date}
                            </p>
                            <p className="text-[10px] text-red-200/60 font-semibold">{deadline.time}</p>
                          </div>
                          <span className="text-[10px] px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/30 to-blue-600/20 text-blue-200 font-bold uppercase tracking-wider">
                            {deadline.course}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm mb-3 line-clamp-2 text-white group-hover/deadline:text-red-100 transition-colors">
                          {deadline.title}
                        </h4>
                        <div className="flex justify-between items-center pt-3 border-t border-red-400/20">
                          <p className="text-[10px] text-red-200/60 font-semibold">{deadline.type}</p>
                          <CountdownTimer
                            deadline={deadline.deadline}
                            secondsUntil={deadline.seconds_until}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 relative z-10">
                  <Clock size={48} className="mx-auto mb-4 opacity-40 text-red-300" />
                  <p className="text-red-200/60 font-semibold">No upcoming deadlines - Great job! 🎉</p>
                </div>
              )}
            </motion.div>

            {/* Recent Grades - Enhanced */}
            {data?.recentGrades && data?.recentGrades.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative group overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-green-500/15 via-emerald-600/10 to-green-600/5 border border-green-500/20 hover:border-green-400/50 transition-all duration-300 mb-8"
              >
                <div className="absolute -inset-full bg-gradient-to-r from-green-500/0 via-green-400/5 to-green-500/0 group-hover:from-green-500/10 group-hover:via-green-400/20 group-hover:to-green-500/10 transition-all duration-500"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-2xl font-bold text-green-300 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                      ✨
                    </div>
                    Recent Grades
                  </h3>
                  {isRefreshing && (
                    <div className="flex items-center gap-2 text-green-300 text-sm">
                      <RefreshCw size={14} className="animate-spin" />
                      Updating...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                  {data?.recentGrades?.map((grade: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + idx * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group/grade relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-400/30 hover:border-green-300/60 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover/grade:from-green-400/5 group-hover/grade:to-emerald-400/5 transition-all"></div>
                      <div className="relative z-10">
                        <p className="text-xs text-green-300 font-black uppercase tracking-widest mb-2">
                          Grade Received
                        </p>
                        <h4 className="font-bold text-lg mb-4 truncate text-white group-hover/grade:text-green-100 transition-colors">
                          {grade.subject}
                        </h4>
                        <div className="flex justify-between items-end pt-4 border-t border-green-400/20">
                          <span className="text-4xl font-black text-green-300">{grade.grade}</span>
                          <span className="text-xs text-green-200/60 font-semibold">{grade.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
      </div>

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
