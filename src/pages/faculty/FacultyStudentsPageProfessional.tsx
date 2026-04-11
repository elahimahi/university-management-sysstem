import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Mail, Phone, MapPin, Award, Calendar, Loader, AlertCircle } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/ui/NotificationContainer';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  student_id: string;
  enrollment_status?: string;
  semester?: string;
  gpa?: number;
  courses_enrolled?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FacultyStudentsPageProfessional: React.FC = () => {
  const { user } = useAuth();
  const { notifications, remove, success: showSuccess, error: showError } = useNotifications();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'enrollment'>('name');

  useEffect(() => {
    fetchStudents();
  }, [user?.id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;

      const response = await apiService.get(`/faculty/get_my_students.php?faculty_id=${user.id}`) as any;
      if (response?.data) {
        const studentsData = Array.isArray(response.data) ? response.data : response.data.students || [];
        setStudents(studentsData);
      }
      showSuccess('Students loaded successfully');
    } catch (error) {
      console.error('Failed to fetch students:', error);
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedStudents = students
    .filter(s =>
      s.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
      } else if (sortBy === 'id') {
        return a.student_id.localeCompare(b.student_id);
      } else {
        return (a.enrollment_status || '').localeCompare(b.enrollment_status || '');
      }
    });

  const getEnrollmentColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'withdrawn':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <PageTransition variant="fade">
      <NotificationContainer notifications={notifications} onClose={remove} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-4 md:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="text-emerald-400" size={40} />
              My Students
            </h1>
            <p className="text-gray-400">Manage and view enrolled students</p>
          </motion.div>

          {/* Stats */}
          {!loading && (
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Total Students</p>
                <p className="text-3xl font-bold text-emerald-400">{students.length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Active</p>
                <p className="text-3xl font-bold text-blue-400">{students.filter(s => s.enrollment_status?.toLowerCase() === 'active').length}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Avg GPA</p>
                <p className="text-3xl font-bold text-purple-400">
                  {(students.reduce((sum, s) => sum + (s.gpa || 0), 0) / Math.max(students.length, 1)).toFixed(2)}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Avg Courses</p>
                <p className="text-3xl font-bold text-orange-400">
                  {(students.reduce((sum, s) => sum + (s.courses_enrolled || 0), 0) / Math.max(students.length, 1)).toFixed(1)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Search & Sort */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'id' | 'enrollment')}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="name" className="bg-slate-900">Sort by Name</option>
              <option value="id" className="bg-slate-900">Sort by Student ID</option>
              <option value="enrollment" className="bg-slate-900">Sort by Status</option>
            </select>
          </motion.div>

          {/* Students Grid */}
          {loading ? (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <LoadingSkeleton key={i} height="h-64" />
              ))}
            </motion.div>
          ) : filteredAndSortedStudents.length === 0 ? (
            <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No students found</h3>
              <p className="text-gray-400">Try adjusting your search filters</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedStudents.map((student, idx) => (
                <motion.div
                  key={student.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedStudent(student)}
                  className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur hover:border-emerald-400/50 transition-all cursor-pointer"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mt-16 -mr-16 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="relative z-10">
                    {/* Student Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-4 flex items-center justify-center text-white font-bold text-xl">
                      {student.firstname.charAt(0)}{student.lastname.charAt(0)}
                    </div>

                    {/* Student Name */}
                    <h3 className="text-xl font-bold text-white mb-1">{student.firstname} {student.lastname}</h3>
                    <p className="text-sm text-blue-300 font-mono mb-4">{student.student_id}</p>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 border rounded-full text-xs font-semibold ${getEnrollmentColor(student.enrollment_status)}`}>
                        {student.enrollment_status || 'Unknown'}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={16} className="text-emerald-400" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone size={16} className="text-emerald-400" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {student.gpa && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Award size={16} className="text-emerald-400" />
                          <span>GPA: {student.gpa.toFixed(2)}</span>
                        </div>
                      )}
                      {student.courses_enrolled && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={16} className="text-emerald-400" />
                          <span>{student.courses_enrolled} courses</span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 rounded-lg text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-all"
                    >
                      View Details →
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Student Detail Modal */}
          <AnimatePresence>
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedStudent(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-6 flex items-center justify-center text-white font-bold text-3xl">
                    {selectedStudent.firstname.charAt(0)}{selectedStudent.lastname.charAt(0)}
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">{selectedStudent.firstname} {selectedStudent.lastname}</h2>
                  <p className="text-emerald-300 font-mono mb-6">{selectedStudent.student_id}</p>

                  <div className="space-y-3 text-sm mb-6">
                    <div>
                      <p className="text-gray-400 mb-1">Email</p>
                      <p className="text-white">{selectedStudent.email}</p>
                    </div>
                    {selectedStudent.phone && (
                      <div>
                        <p className="text-gray-400 mb-1">Phone</p>
                        <p className="text-white">{selectedStudent.phone}</p>
                      </div>
                    )}
                    {selectedStudent.semester && (
                      <div>
                        <p className="text-gray-400 mb-1">Semester</p>
                        <p className="text-white">{selectedStudent.semester}</p>
                      </div>
                    )}
                    {selectedStudent.gpa && (
                      <div>
                        <p className="text-gray-400 mb-1">GPA</p>
                        <p className="text-white font-bold text-lg">{selectedStudent.gpa.toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStudent(null)}
                    className="w-full px-4 py-2 bg-emerald-500 rounded-lg text-white font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    Close
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default FacultyStudentsPageProfessional;
