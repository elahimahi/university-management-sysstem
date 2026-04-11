import React, { useEffect, useState } from 'react';
import { Star, Save, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/app.constants';

interface StudentGrade {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  course_id: number;
  course_code: string;
  current_grade: string | null;
  new_grade: string;
}

const FacultyGradesSubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/faculty/get_my_courses.php?faculty_id=${user?.id}`
      );
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
        setError(null);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      setError('Network error while fetching courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourse(courseId);
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/faculty/get_course_students.php?course_id=${courseId}`
      );
      const data = await response.json();

      if (response.ok) {
        const studentsList = data.students || [];
        setStudents(
          studentsList.map((student: any) => ({
            enrollment_id: student.enrollment_id,
            student_id: student.student_id,
            student_name: student.name,
            student_email: student.email,
            course_id: courseId,
            course_code: courses.find(c => c.id === courseId)?.code || '',
            current_grade: null,
            new_grade: '',
          }))
        );
        setError(null);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Network error while fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (enrollmentId: number, grade: string) => {
    setStudents(
      students.map(record =>
        record.enrollment_id === enrollmentId
          ? { ...record, new_grade: grade }
          : record
      )
    );
  };

  const handleSaveGrades = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    const gradesToSave = students.filter(s => s.new_grade);
    if (gradesToSave.length === 0) {
      setError('Please enter at least one grade');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/faculty/submit_grades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourse,
          grades: gradesToSave,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ ${data.updated} grades saved successfully!`);
        // Clear grades after save
        setStudents(students.map(s => ({ ...s, new_grade: '' })));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to save grades');
      }
    } catch (err) {
      setError('Network error while saving grades');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const gradeScale = [
    { label: 'A+ (90-100)', value: 'A+' },
    { label: 'A (85-89)', value: 'A' },
    { label: 'A- (82-84)', value: 'A-' },
    { label: 'B+ (80-81)', value: 'B+' },
    { label: 'B (75-79)', value: 'B' },
    { label: 'B- (72-74)', value: 'B-' },
    { label: 'C+ (70-71)', value: 'C+' },
    { label: 'C (65-69)', value: 'C' },
    { label: 'D (60-64)', value: 'D' },
    { label: 'F (Below 60)', value: 'F' },
  ];

  const filteredStudents = students.filter(s =>
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submittedCount = students.filter(s => s.new_grade).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⭐ Submit Grades</h1>
          <p className="text-amber-200">Record student grades for your courses</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 bg-green-900/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Selection */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => handleCourseSelect(parseInt(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        {students.length > 0 ? (
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-700/50 border-b border-slate-600 font-semibold text-gray-300">
              <div>Student Name</div>
              <div>Email</div>
              <div>Current Grade</div>
              <div>New Grade</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-slate-600 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div key={student.enrollment_id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center hover:bg-slate-700/30">
                  <div>
                    <p className="text-white font-semibold">{student.student_name}</p>
                  </div>
                  <div className="text-gray-300 text-sm">{student.student_email}</div>
                  <div className="text-gray-300">
                    {student.current_grade || '—'}
                  </div>
                  <div>
                    <select
                      value={student.new_grade}
                      onChange={(e) => handleGradeChange(student.enrollment_id, e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Enter Grade --</option>
                      {gradeScale.map(grade => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {student.new_grade && (
                      <span className="px-3 py-1 rounded-full bg-amber-900/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 w-fit">
                        <Star size={12} fill="currentColor" />
                        {student.new_grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary and Save */}
            <div className="p-4 bg-slate-700/50 border-t border-slate-600">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-300">
                  <span className="font-semibold">
                    {submittedCount}
                  </span>
                  {' '}/ {students.length} grades entered
                </div>
                <button
                  onClick={handleSaveGrades}
                  disabled={saving || submittedCount === 0}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save All Grades'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-300 bg-slate-800/50 border border-slate-600 rounded-lg">
            <Star size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a course to view and grade students</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyGradesSubmissionPage;
