import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api.service';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category?: string;
  level?: string;
  instructor_id?: number;
  first_name?: string;
  last_name?: string;
  enrolled_count?: number;
}

interface EnrolledCourse extends Course {
  semester: string;
  status: string;
  enrolled_at: string;
}

const StudentRegistrationPage: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [semester, setSemester] = useState<string>('Spring 2024');
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Fetch available courses
      const availableResponse = await apiService.get<{ status: string; courses: Course[] }>(
        '/courses/available'
      );
      if (availableResponse.status === 'success') {
        setAvailableCourses(availableResponse.courses || []);
      }

      // Fetch enrolled courses
      const enrolledResponse = await apiService.get<{ status: string; courses: EnrolledCourse[] }>(
        '/student/courses'
      );
      if (enrolledResponse.status === 'success') {
        setEnrolledCourses(enrolledResponse.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    if (!semester.trim()) {
      toast.error('Please select a semester');
      return;
    }

    try {
      setEnrolling(courseId);
      const response = await apiService.post<{ status: string; message?: string; enrollment?: any }>(
        '/student/enroll',
        { course_id: courseId, semester }
      );

      if (response.status === 'success') {
        toast.success('Course enrollment successful!');
        fetchCourses();
      } else {
        toast.error(response.message || 'Failed to enroll in course');
      }
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to enroll in course';
      toast.error(errorMessage);
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrolledCourses.some(
      (course) => course.id === courseId && course.status === 'active'
    );
  };

  const filteredCourses = availableCourses.filter((course) =>
    course.code.toLowerCase().includes(filter.toLowerCase()) ||
    course.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex items-center justify-center">
        <div className="text-lg text-white">Loading courses...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.55)] mb-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-16 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm text-cyan-200 shadow-inner shadow-cyan-500/10 ring-1 ring-white/10">
                <BookOpen className="w-5 h-5 text-cyan-300" />
                Course Registration
              </div>
              <h1 className="mt-4 text-4xl font-bold text-white">Register your courses with style</h1>
              <p className="mt-3 max-w-2xl text-slate-300 text-lg">
                Browse available classes, enroll quickly, and keep your schedule up to date with animated cards and crisp visuals.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Enrolled</p>
                <p className="mt-3 text-4xl font-extrabold text-white">{enrolledCourses.length}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-5 shadow-xl shadow-violet-500/10 backdrop-blur-md text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Available</p>
                <p className="mt-3 text-4xl font-extrabold text-white">{filteredCourses.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-[1.5fr_1fr] mb-10"
        >
          <div className="rounded-[2rem] bg-slate-900/80 border border-white/10 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-lg">
            <h2 className="text-xl font-semibold text-white">Your Enrolled Courses</h2>
            <p className="mt-2 text-sm text-slate-400">A quick look at the courses you are already registered for.</p>
            <div className="mt-6 grid gap-4">
              {enrolledCourses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/70 p-8 text-center text-slate-400">
                  You haven't enrolled in any courses yet.
                </div>
              ) : (
                enrolledCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-3xl border border-white/5 bg-slate-950/90 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">{course.code}</p>
                        <h3 className="mt-2 text-xl font-bold text-white">{course.name}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">{course.status}</span>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-400">
                      <div>Semester: {course.semester}</div>
                      <div>Credits: {course.credits}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-white/10 p-6 shadow-[0_30px_80px_rgba(56,189,248,0.12)] backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white">Search & Semester</h2>
            <p className="mt-2 text-sm text-slate-400">Filter available classes and choose the correct semester before enrolling.</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="">Choose a semester...</option>
                  <option value="Spring 2024">Spring 2024</option>
                  <option value="Summer 2024">Summer 2024</option>
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Winter 2024">Winter 2024</option>
                  <option value="Spring 2025">Spring 2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Search courses</label>
                <input
                  type="text"
                  placeholder="Type course code or name..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            return (
              <motion.div
                key={course.id}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`rounded-[2rem] border border-white/10 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition-all ${
                  enrolled ? 'bg-emerald-950/90 border-emerald-500/20' : 'bg-slate-950/90 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">{course.code}</p>
                    <h3 className="mt-2 text-xl font-bold text-white">{course.name}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${enrolled ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/10 text-slate-100'}`}>
                    {enrolled ? 'Enrolled' : 'Open'}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-300 mb-6">
                  <p>
                    <span className="font-semibold text-white">Credits:</span> {course.credits}
                  </p>
                  {course.category && (
                    <p>
                      <span className="font-semibold text-white">Category:</span> {course.category}
                    </p>
                  )}
                  {course.level && (
                    <p>
                      <span className="font-semibold text-white">Level:</span> {course.level}
                    </p>
                  )}
                  {course.first_name && (
                    <p>
                      <span className="font-semibold text-white">Instructor:</span> {course.first_name} {course.last_name}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolled || enrolling === course.id}
                  className={`w-full rounded-3xl py-3 font-semibold transition-all ${
                    enrolled
                      ? 'bg-emerald-500 text-white cursor-not-allowed opacity-80'
                      : enrolling === course.id
                      ? 'bg-cyan-500 text-white cursor-wait'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  }`}
                >
                  <Plus size={18} />
                  {enrolled ? 'Already Enrolled' : enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentRegistrationPage;
