import React, { useState, useEffect } from 'react';
import { LogIn, Clock, AlertCircle, CheckCircle, TrendingUp, Lock } from 'lucide-react';
import axios from 'axios';
import { getAccessToken } from '../../utils/auth.utils';
import { useAuth } from '../../contexts/AuthContext';

interface LoginActivity {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  course_name: string;
  login_count: number;
  last_login: string | null;
  first_login: string | null;
  today_logins: number;
}

const FacultyLoginActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState<'last_login' | 'login_count' | 'name'>('last_login');

  useEffect(() => {
    // Check if user is faculty before fetching
    if (user && user.role === 'faculty') {
      fetchLoginActivity();
    } else {
      setLoading(false);
      if (user && user.role !== 'faculty') {
        setError('Forbidden - Only faculty members can view student login activity');
      }
    }
  }, [user]);

  const fetchLoginActivity = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/faculty/login-activity`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setActivities(response.data.activity || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch login activity');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = (key: keyof LoginActivity): string[] => {
    const arr = activities.map((a) => String(a[key])).filter(Boolean);
    return arr.filter((v, i) => arr.indexOf(v) === i);
  };

  const courses = getUniqueCategories('course_name');

  const filteredActivities = activities.filter((activity) => {
    if (filterCourse === 'all') return true;
    return activity.course_name === filterCourse;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sortBy) {
      case 'last_login':
        if (!a.last_login) return 1;
        if (!b.last_login) return -1;
        return new Date(b.last_login).getTime() - new Date(a.last_login).getTime();
      case 'login_count':
        return (b.login_count || 0) - (a.login_count || 0);
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-8">
        <TrendingUp className="inline mr-2" size={20} />
        Loading login activity...
      </div>
    );
  }

  // Don't render anything if user is not faculty
  if (error && error.includes('Forbidden')) {
    return null;
  }

  const neverLoggedIn = sortedActivities.filter((a) => !a.last_login).length;
  const loggedInToday = sortedActivities.filter((a) => a.today_logins > 0).length;
  const hasLoggedIn = sortedActivities.length - neverLoggedIn;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Total Students</p>
          <h3 className="text-2xl font-bold text-[#FFB347]">{sortedActivities.length}</h3>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Logged In Today</p>
          <h3 className="text-2xl font-bold text-green-400">{loggedInToday}</h3>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Never Logged In</p>
          <h3 className="text-2xl font-bold text-red-400">{neverLoggedIn}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Filter by Course</label>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[#FFB347] outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-400 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-[#FFB347] outline-none"
          >
            <option value="last_login">Last Login</option>
            <option value="login_count">Total Login Count</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Login Activity Table */}
      <div className="glass-panel p-6 rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Student</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Course</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400">Total Logins</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400">Today</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Last Login</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity) => (
              <tr key={`${activity.id}-${activity.course_name}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-semibold">
                      {activity.first_name} {activity.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{activity.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">{activity.course_name}</td>
                <td className="py-3 px-4 text-center font-bold text-blue-400">
                  {activity.login_count || 0}
                </td>
                <td className="py-3 px-4 text-center">
                  {activity.today_logins > 0 ? (
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold">
                      {activity.today_logins}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">0</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {activity.last_login ? (
                    <div>
                      <p className="text-xs">
                        {new Date(activity.last_login).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.last_login).toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <span className="text-red-400 text-xs">Never</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {activity.last_login ? (
                    <div title="Active">
                      <CheckCircle size={16} className="inline text-green-400" aria-label="Active" />
                    </div>
                  ) : (
                    <div title="Inactive">
                      <AlertCircle size={16} className="inline text-red-400" aria-label="Inactive" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedActivities.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <LogIn size={32} className="mx-auto mb-2 opacity-50" />
            <p>No login activity to display</p>
          </div>
        )}
      </div>

      {/* Student Status Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg border border-green-500/20 bg-green-500/5">
          <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
            <CheckCircle size={16} /> Active Students
          </div>
          <p className="text-2xl font-bold text-green-400 mb-1">{hasLoggedIn}</p>
          <p className="text-xs text-gray-400">Have logged in at least once</p>
        </div>
        <div className="glass-panel p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
            <AlertCircle size={16} /> Inactive Students
          </div>
          <p className="text-2xl font-bold text-red-400 mb-1">{neverLoggedIn}</p>
          <p className="text-xs text-gray-400">
            Have never logged in - Follow up required
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacultyLoginActivity;
