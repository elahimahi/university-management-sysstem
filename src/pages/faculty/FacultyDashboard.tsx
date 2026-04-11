import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessToken } from '../../utils/auth.utils';
import Sidebar from '../../components/ui/Sidebar';
import Navbar from '../../components/ui/Navbar';
import StatsCard from '../../components/ui/StatsCard';
import FacultyStudentEvaluation from '../../components/faculty/FacultyStudentEvaluation';
import FacultyLoginActivity from '../../components/faculty/FacultyLoginActivity';
import {
    BookOpen,
    Users,
    Clock,
    Calendar,
    Bell,
    Settings,
    LogOut,
    LayoutDashboard,
    CheckSquare,
    FileText,
    GraduationCap,
    RefreshCw
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/SD_Project/university-management-sysstem/backend';

const FacultyDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [stats, setStats] = useState<any>({stats: {}, courses: [], recentActivity: []});
    const [loading, setLoading] = useState(true);
    const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [gradeForm, setGradeForm] = useState({
        enrollmentId: '',
        grade: '',
        gradePoint: '',
        type: 'Quiz'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();

    const fetchData = async (isSilent = false) => {
        try {
            if (!isSilent) {
                setIsRefreshing(true);
            }
            const token = getAccessToken();
            const [statsRes, studentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/faculty/faculty_stats.php`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/faculty/students_by_faculty.php`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const facultyStats = statsRes.data;
            setStats(facultyStats || {stats: {}, courses: [], recentActivity: []});
            setEligibleStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching faculty data:', error);
            if (!isSilent) {
                setStats({stats: {}, courses: [], recentActivity: []});
            }
            setEligibleStudents([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        // Initial fetch
        fetchData(true);

        // Set up polling interval - refresh every 5 seconds for better responsiveness
        pollingIntervalRef.current = setInterval(() => {
            fetchData(true);
        }, 5000); // 5 seconds

        // Cleanup on unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [user]);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradeForm.enrollmentId || !gradeForm.grade || !gradeForm.gradePoint) {
            setMessage({ type: 'error', text: 'Please fill all required fields' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const token = getAccessToken();
            await axios.post(`${API_BASE_URL}/grades/add`, {
                enrollment_id: gradeForm.enrollmentId,
                grade: gradeForm.grade,
                grade_point: parseFloat(gradeForm.gradePoint),
                assessment_type: gradeForm.type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Grade submitted successfully!' });
            setGradeForm({ enrollmentId: '', grade: '', gradePoint: '', type: 'Quiz' });

            // Refresh stats to show new activity
            await fetchData(true);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit grade' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const menuItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/faculty/dashboard' },
        { label: 'My Courses', icon: <BookOpen size={20} />, href: '/faculty/courses' },
        { label: 'Students', icon: <Users size={20} />, href: '/faculty/students' },
        { label: 'Attendance', icon: <Clock size={20} />, href: '/faculty/attendance' },
        { label: 'Assignments', icon: <CheckSquare size={20} />, href: '/faculty/assignments' },
        { label: 'Grades', icon: <CheckSquare size={20} />, href: '/faculty/grades' },
        { label: 'Reports', icon: <FileText size={20} />, href: '/faculty/reports' },
    ];

    const chartData = stats?.courses?.map((c: any) => ({
        name: c.code,
        students: parseInt(c.student_count),
    })) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050b18] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#030712] text-white">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 left-16 h-72 w-72 rounded-full bg-gradient-to-br from-gold-400/40 to-transparent blur-3xl opacity-80 animate-blob"></div>
                <div className="absolute top-24 right-10 h-80 w-80 rounded-full bg-gradient-to-br from-sky-400/25 to-transparent blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-transparent blur-3xl opacity-65 animate-blob animation-delay-4000"></div>
            </div>
            <Navbar
                items={[]}
                rightContent={
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/faculty/notifications')} className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-sm font-semibold">Prof. {user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-navy-900 shadow-lg border-2 border-white/20">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
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

                <main className={`relative z-10 flex-1 transition-all duration-300 px-6 py-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Header */}
                        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end justify-between">
                            <div className="space-y-4">
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-5xl lg:text-6xl font-semibold tracking-wide leading-tight bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-gold-300 text-transparent bg-clip-text"
                                >
                                    Welcome Back, <span className="bg-gradient-to-r from-gold-300 via-orange-300 to-fuchsia-300 text-transparent bg-clip-text">Prof. {user?.lastName}</span>
                                </motion.h1>
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 backdrop-blur-xl shadow-xl shadow-black/20">
                                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Today</p>
                                        <p className="font-semibold text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    {lastUpdated && (
                                        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300 backdrop-blur-xl shadow-xl shadow-black/20">
                                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">Last Synced</p>
                                            <p className="font-semibold text-white flex items-center gap-2">
                                                <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                                {isRefreshing ? 'Refreshing now' : `Updated ${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button
                                    onClick={() => fetchData(false)}
                                    disabled={isRefreshing}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border border-transparent rounded-2xl font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-fuchsia-500 text-white rounded-2xl font-semibold shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </header>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatsCard
                                title="Total Students"
                                value={stats?.stats?.totalStudents || 0}
                                icon={<Users size={24} />}
                                color="gold"
                                trend={{ value: 12, isPositive: true }}
                            />
                            <StatsCard
                                title="Active Courses"
                                value={stats?.stats?.totalCourses || 0}
                                icon={<BookOpen size={24} />}
                                color="navy"
                            />
                            <StatsCard
                                title="Attendance Rate"
                                value={stats?.stats?.attendanceRate || 0}
                                suffix="%"
                                icon={<Clock size={24} />}
                                color="success"
                                trend={{ value: 3, isPositive: true }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-base font-semibold text-white mb-3">Present</h3>
                                <p className="text-4xl font-bold text-emerald-400">
                                    {stats?.stats?.attendanceBreakdown?.presentPercent ?? 0}%
                                </p>
                                <p className="text-sm text-gray-400 mt-2">Attendance marked present</p>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-base font-semibold text-white mb-3">Late</h3>
                                <p className="text-4xl font-bold text-amber-400">
                                    {stats?.stats?.attendanceBreakdown?.latePercent ?? 0}%
                                </p>
                                <p className="text-sm text-gray-400 mt-2">Attendance marked late</p>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-base font-semibold text-white mb-3">Absent</h3>
                                <p className="text-4xl font-bold text-rose-400">
                                    {stats?.stats?.attendanceBreakdown?.absentPercent ?? 0}%
                                </p>
                                <p className="text-sm text-gray-400 mt-2">Attendance marked absent</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Chart Section */}
                            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold-400">
                                    <GraduationCap size={20} /> Enrollment Distribution
                                </h3>
                                <div className="h-[300px] w-full min-w-0 min-h-0 flex items-center justify-center">
                                    {chartData && chartData.length > 0 ? (
                                        <ResponsiveContainer width={`100%`} height={300} minWidth={300} minHeight={300}>
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                                <XAxis dataKey="name" stroke="#94a3b8" />
                                                <YAxis stroke="#94a3b8" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#FFB347' }}
                                                />
                                                <Bar dataKey="students" fill="#FFB347" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-gray-400">No course data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity (Smaller box) */}
                            <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold-400">
                                    <Bell size={20} /> Activity Feed
                                </h3>
                                <div className="space-y-6">
                                    {stats?.recentActivity && stats?.recentActivity.length > 0 ? (
                                        stats?.recentActivity?.map((activity: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                                                    {activity.type === 'enrollment' ? <Users size={18} /> :
                                                        activity.type === 'grade' ? <CheckSquare size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-200 font-medium">{activity.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Grade Entry Form */}
                        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden group mb-8">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold-400/10 transition-colors"></div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gold-400">
                                <CheckSquare size={24} /> Submit New Grade
                            </h3>

                            <form onSubmit={handleGradeSubmit} className="space-y-4 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Student & Course</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                                            value={gradeForm.enrollmentId}
                                            onChange={(e) => setGradeForm({ ...gradeForm, enrollmentId: e.target.value })}
                                        >
                                            <option value="" className="bg-navy-900">Select Enrolled Student</option>
                                            {eligibleStudents?.map((s: any) => (
                                                <option key={s.enrollment_id} value={s.enrollment_id} className="bg-navy-900">
                                                    {s.first_name} {s.last_name} - {s.course_code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assessment Type</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                                            value={gradeForm.type}
                                            onChange={(e) => setGradeForm({ ...gradeForm, type: e.target.value })}
                                        >
                                            <option value="Quiz" className="bg-navy-900">Quiz</option>
                                            <option value="Assignment" className="bg-navy-900">Assignment</option>
                                            <option value="Midterm" className="bg-navy-900">Midterm</option>
                                            <option value="Final" className="bg-navy-900">Final Exam</option>
                                            <option value="Project" className="bg-navy-900">Project</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Letter Grade</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. A, B+, C"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                                            value={gradeForm.grade}
                                            onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Grade Points</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4.0"
                                            placeholder="0.00 - 4.00"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                                            value={gradeForm.gradePoint}
                                            onChange={(e) => setGradeForm({ ...gradeForm, gradePoint: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className={`p-3 rounded-xl text-xs font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                                    >
                                        {message.text}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-900 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Recording Grade...' : 'Secure Submit Grade'}
                                </button>
                            </form>
                        </div>

                        {/* Student Evaluation Section */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-6 text-gold-400 flex items-center gap-2">
                                <Users size={24} /> Evaluate Student Progress
                            </h3>
                            <FacultyStudentEvaluation />
                        </div>

                        {/* Login Activity Section */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-6 text-gold-400 flex items-center gap-2">
                                <Clock size={24} /> Student Login Activity
                            </h3>
                            <FacultyLoginActivity />
                        </div>

                        {/* Courses List */}
                        <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-hidden mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gold-400">My Active Courses</h3>
                                <button className="text-sm text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-300 transition-all">
                                    Manage All Courses
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stats?.courses?.map((course: any) => (
                                    <motion.div
                                        key={course.id}
                                        whileHover={{ y: -5 }}
                                        className="p-5 rounded-2xl bg-navy-800/50 border border-white/5 hover:border-gold-500/20 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 mb-4 font-bold">
                                            {course.code.split('-')[0]}
                                        </div>
                                        <h4 className="font-bold text-lg mb-1">{course.name}</h4>
                                        <p className="text-gold-500 text-sm font-mono mb-4">{course.code}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-2 text-gray-400">
                                                <Users size={14} /> {course.student_count} Students
                                            </span>
                                            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                                                Details
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>

            <style>{`
                .glass-panel {
                  background: linear-gradient(135deg, rgba(7, 12, 28, 0.92), rgba(20, 28, 52, 0.8));
                  backdrop-filter: blur(28px);
                  -webkit-backdrop-filter: blur(28px);
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.32);
                }
                .animate-blob {
                  animation: blob 9s infinite;
                }
                .animation-delay-2000 {
                  animation-delay: 2.2s;
                }
                .animation-delay-4000 {
                  animation-delay: 4.2s;
                }
                @keyframes blob {
                  0%, 100% { transform: translate(0px, 0px) scale(1); }
                  25% { transform: translate(10px, -20px) scale(1.05); }
                  50% { transform: translate(-10px, 10px) scale(0.95); }
                  75% { transform: translate(15px, 18px) scale(1.02); }
                }
            `}</style>
        </div>
    );
};

export default FacultyDashboard;
