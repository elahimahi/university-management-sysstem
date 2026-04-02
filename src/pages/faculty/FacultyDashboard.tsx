import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
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
    GraduationCap
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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost/Database_Project/Database-main/Database-main/backend';

const FacultyDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [stats, setStats] = useState<any>({stats: {}, courses: [], recentActivity: []});
    const [loading, setLoading] = useState(true);
    const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
    const [gradeForm, setGradeForm] = useState({
        enrollmentId: '',
        grade: '',
        gradePoint: '',
        type: 'Quiz'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getAccessToken();
                const [statsRes, studentsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/faculty/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/faculty/courses-students`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setStats(statsRes.data || {stats: {}, courses: [], recentActivity: []});
                setEligibleStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
            } catch (error) {
                console.error('Error fetching faculty data:', error);
                setStats({stats: {}, courses: [], recentActivity: []});
                setEligibleStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
            const statsRes = await axios.get(`${API_BASE_URL}/faculty/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);

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
        <div className="min-h-screen bg-[#050b18] text-white">
            <Navbar
                items={[]}
                rightContent={
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
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

                <main className={`flex-1 transition-all duration-300 p-8 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Header */}
                        <header className="mb-12 flex justify-between items-end">
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-4xl font-bold text-white mb-2"
                                >
                                    Welcome Back, <span className="text-gold-400">Prof. {user?.lastName}</span>
                                </motion.h1>
                                <p className="text-gray-400 flex items-center gap-2">
                                    <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                            >
                                <LogOut size={18} /> Logout
                            </button>
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
                            <StatsCard
                                title="Pending Grades"
                                value={stats?.stats?.pendingGrades || 0}
                                icon={<CheckSquare size={24} />}
                                color="warning"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Chart Section */}
                            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold-400">
                                    <GraduationCap size={20} /> Enrollment Distribution
                                </h3>
                                <div className="h-[300px] w-full min-w-0 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} aspect={2}>
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
                                </div>
                            </div>

                            {/* Recent Activity (Smaller box) */}
                            <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-gold-500/30 transition-colors">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gold-400">
                                    <Bell size={20} /> Activity Feed
                                </h3>
                                <div className="space-y-6">
                                    {stats?.recentActivity?.map((activity: any, idx: number) => (
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
                                    ))}
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

                                                {/* Login Activity Section */}
                                                <div className="mb-8">
                                                    <h3 className="text-2xl font-bold mb-6 text-gold-400 flex items-center gap-2">
                                                        <Clock size={24} /> Student Login Activity
                                                    </h3>
                                                    <FacultyLoginActivity />
                                                </div>
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
                  background: rgba(255, 255, 255, 0.03);
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
};

export default FacultyDashboard;
