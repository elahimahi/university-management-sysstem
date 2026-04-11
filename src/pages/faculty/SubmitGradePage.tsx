import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiService } from '../../services/api.service';
import toast from 'react-hot-toast';

// Grade point mapping - defined outside component to avoid recreating on every render
const GRADE_POINT_MAPPING: { [key: string]: number } = {
  'A+': 4.0,
  'A': 3.75,
  'A-': 3.5,
  'B+': 3.25,
  'B': 3.0,
  'B-': 2.75,
  'C+': 2.5,
  'C': 2.25,
  'D': 2.0,
  'F': 0.0,
};

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  students: StudentEnrollment[];
}

interface StudentEnrollment {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_id: number;
  semester: string;
  enrollment_status: string;
  current_grade: number | null;
  grades_count: number;
}

const SubmitGradePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [letterGrade, setLetterGrade] = useState('');
  const [gradePoints, setGradePoints] = useState('');
  const [manualGradePoints, setManualGradePoints] = useState('');
  const [assessmentType, setAssessmentType] = useState('Final Score');
  const [markCompleted, setMarkCompleted] = useState(false);

  // Compute grade points directly - SIMPLE VERSION
  const getGradePoints = (grade: string): string => {
    if (!grade || grade.trim() === '') return '';
    const upper = grade.toUpperCase().trim();
    const point = GRADE_POINT_MAPPING[upper];
    if (point !== undefined) {
      return point.toFixed(2);
    }
    return '';
  };

  // AUTO-CALCULATE GRADE POINTS WHEN LETTER GRADE CHANGES
  useEffect(() => {
    const computed = getGradePoints(letterGrade);
    setGradePoints(computed);
    setManualGradePoints(computed);
  }, [letterGrade]);

  // Validation helper function
  const isFormValid = () => {
    // 1. Check course selected
    if (!selectedCourse) return false;

    // 2. Check student selected
    if (!selectedStudent) return false;

    // 3. Check letter grade entered
    if (!letterGrade || letterGrade.trim() === '') return false;
    
    // 4. Check grade format and mapping
    const upperGrade = letterGrade.toUpperCase().trim();
    const isValidFormat = /^[A-F]([+\-])?$/.test(upperGrade);
    if (!isValidFormat) return false;
    
    // 5. Check grade exists in mapping
    const existsInMapping = upperGrade in GRADE_POINT_MAPPING;
    if (!existsInMapping) return false;

    // 6. Check grade points calculated
    if (!gradePoints || gradePoints.trim() === '') return false;

    // 7. CHECK MANUAL GRADE POINTS MATCH AUTO-CALCULATED
    if (!manualGradePoints || manualGradePoints.trim() === '') return false;
    if (manualGradePoints !== gradePoints) return false;

    return true;
  };

  const getValidationMessage = () => {
    if (!selectedCourse) return '⚠️ Select a course';
    if (!selectedStudent) return '⚠️ Select a student';
    if (!letterGrade) return '⚠️ Enter a letter grade';
    
    const upperGrade = letterGrade.toUpperCase().trim();
    const isValidFormat = /^[A-F]([+\-])?$/.test(upperGrade);
    
    if (!isValidFormat) return `⚠️ Invalid grade format: "${upperGrade}"`;
    if (!(upperGrade in GRADE_POINT_MAPPING)) return `⚠️ Grade "${upperGrade}" NOT found`;
    if (!gradePoints) return '⚠️ Could not calculate grade points';
    if (!manualGradePoints) return '⚠️ Confirm the grade points';
    if (manualGradePoints !== gradePoints) return `⚠️ Points mismatch! Should be ${gradePoints} for ${upperGrade}`;
    
    return '✅ Ready to submit!';
  };

  const formValid = isFormValid();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<{
        status: string;
        courses: Course[];
      }>('/faculty/grading-students');

      if (response.status === 'success') {
        setCourses(response.courses || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const getStudentsForCourse = () => {
    if (!selectedCourse) return [];
    const course = courses.find((c) => c.course_id === selectedCourse);
    return course?.students || [];
  };

  const handleLetterGradeChange = (value: string) => {
    const cleanValue = value.toUpperCase().trim();
    const isValidFormat = /^[A-F]([+\-])?$/.test(cleanValue);
    
    if (isValidFormat || cleanValue === '') {
      setLetterGrade(cleanValue);
    } else {
      toast.error('⚠️ Invalid format. Use: A+, B-, C, F, etc.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // BLOCK SUBMISSION IF FORM IS INVALID
    if (!isFormValid()) {
      const message = getValidationMessage();
      toast.error(`🚫 ${message}`);
      return;
    }

    // ===== STRICT VALIDATION =====
    
    // 1. Validate Course Selection
    if (!selectedCourse) {
      toast.error('❌ REQUIRED: Must select a course');
      return;
    }

    // 2. Validate Student Selection
    if (!selectedStudent) {
      toast.error('❌ REQUIRED: Must select a student');
      return;
    }

    // 3. Validate Letter Grade - Not Empty
    if (!letterGrade || letterGrade.trim().length === 0) {
      toast.error('❌ REQUIRED: Must enter a letter grade (A+, A, B+, etc.)');
      return;
    }

    // 4. Validate Letter Grade - Proper Format
    const upperGrade = letterGrade.toUpperCase().trim();
    const isValidFormat = /^[A-F]([+\-])?$/.test(upperGrade);
    
    if (!isValidFormat) {
      toast.error('❌ INVALID FORMAT: Use only A-F with optional +/- (e.g., A+, B-, C)');
      return;
    }

    // 5. Validate Letter Grade - Exists in Mapping
    if (!(upperGrade in GRADE_POINT_MAPPING)) {
      toast.error(`❌ NOT FOUND: "${upperGrade}" is not a valid grade`);
      return;
    }

    // 6. Validate Grade Points Computed Correctly
    const correctGPA = GRADE_POINT_MAPPING[upperGrade];
    
    if (!gradePoints || gradePoints.trim() === '') {
      toast.error('❌ ERROR: Could not compute grade points');
      return;
    }

    const computedGPA = parseFloat(gradePoints);
    if (isNaN(computedGPA)) {
      toast.error('❌ ERROR: Grade points calculation error');
      return;
    }

    if (Math.abs(computedGPA - correctGPA) > 0.01) {
      toast.error(`❌ GRADE MISMATCH: "${upperGrade}" should give ${correctGPA.toFixed(2)}`);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        enrollment_id: selectedStudent,
        grade: upperGrade,
        grade_point: parseFloat(manualGradePoints),
        assessment_type: assessmentType,
        mark_completed: markCompleted,
      };

      const response = await apiService.post<{
        status: string;
        message: string;
      }>('/grades/add', payload);

      if (response.status === 'success') {
        toast.success('✅ ' + (response.message || 'Grade submitted successfully!'));

        // Reset form
        setSelectedCourse('');
        setSelectedStudent('');
        setLetterGrade('');
        setGradePoints('');
        setManualGradePoints('');
        setAssessmentType('Final Score');
        setMarkCompleted(false);

        // Refresh data
        fetchStudents();
      } else {
        // Show detailed error message from backend
        let errorMessage = response.message || 'Failed to submit grade';
        toast.error('❌ ' + errorMessage);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 
                      error?.message || 
                      'Failed to submit grade';
      toast.error('❌ ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-800 p-8 flex items-center justify-center">
        <Loader className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  const currentStudents = getStudentsForCourse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-navy-900 dark:to-navy-800 p-8"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-gold-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Submit New Grade
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Enter grade information below to submit scores for your students.
          </p>
        </div>

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          onKeyPress={(e) => {
            // Prevent Enter key from submitting if form is invalid
            if (e.key === 'Enter' && !formValid) {
              e.preventDefault();
              toast.error('🚫 ' + getValidationMessage());
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-navy-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-navy-700"
        >
          {/* Alert Banner - Show if form is invalid */}
          {!formValid && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl flex gap-3 items-start"
            >
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-700 dark:text-red-300 text-sm">
                  ❌ Form is INCOMPLETE - Cannot submit yet
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {getValidationMessage()}
                </p>
              </div>
            </motion.div>
          )}

          {/* Grade Mapping Reference */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-3">
              📋 Grade Point Mapping (Points must be EXACT)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">A+</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">4.00</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">A</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">3.75</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">A-</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">3.50</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">B+</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">3.25</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">B</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">3.00</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">B-</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">2.75</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">C+</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">2.50</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">C</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">2.25</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">D</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">2.00</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-navy-700 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-sm font-bold text-gray-700 dark:text-white">F</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">0.00</div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Student & Course
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value ? parseInt(e.target.value) : '');
                    setSelectedStudent('');
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 transition ${
                    selectedCourse
                      ? 'border-green-500 dark:border-green-500 focus:ring-green-500'
                      : 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                  }`}
                >
                  <option value="">Select Course...</option>
                  {courses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Enrolled Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : '')}
                  disabled={!selectedCourse}
                  className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedCourse === ''
                      ? 'border-gray-300 dark:border-gray-600'
                      : selectedStudent
                      ? 'border-green-500 dark:border-green-500 focus:ring-green-500'
                      : 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                  }`}
                >
                  <option value="">Select Student...</option>
                  {currentStudents.map((student) => (
                    <option key={student.enrollment_id} value={student.enrollment_id}>
                      {student.first_name} {student.last_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grade Inputs */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Grade Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Letter Grade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Letter Grade
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. A, B+, C"
                    value={letterGrade}
                    onChange={(e) => handleLetterGradeChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !formValid) {
                        e.preventDefault();
                        toast.error('🚫 ' + getValidationMessage());
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 transition placeholder-gray-400 ${
                      letterGrade === ''
                        ? 'border-gray-300 dark:border-navy-600 focus:ring-blue-500'
                        : letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING
                        ? 'border-green-500 dark:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                    }`}
                  />
                  {letterGrade !== '' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Examples: A+, A, A-, B+, B, B-, C+, C, D, F
                </p>
                {(() => {
                  const upperGrade = letterGrade.toUpperCase().trim();
                  const isInvalid = letterGrade !== '' && !(upperGrade in GRADE_POINT_MAPPING);
                  return isInvalid ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                      ❌ Invalid grade. Use: A+, A, A-, B+, B, B-, C+, C, D, or F
                    </p>
                  ) : null;
                })()}
              </div>

              {/* Grade Points - Display Box */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Grade Points (GPA) - Auto-Calculated
                </label>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                  className={`w-full px-6 py-5 border-3 rounded-2xl flex items-center justify-center min-h-[70px] transition-all transform ${
                    letterGrade === ''
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-700'
                      : letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING
                      ? 'border-green-500 dark:border-green-400 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/50 dark:to-green-800/30 shadow-lg shadow-green-500/30'
                      : 'border-red-500 dark:border-red-400 bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/50 dark:to-red-800/30 shadow-lg shadow-red-500/30'
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`text-5xl font-black drop-shadow-lg ${
                        letterGrade === ''
                          ? 'text-gray-400 dark:text-gray-500'
                          : letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {gradePoints || '—'}
                    </div>
                    {gradePoints && gradePoints !== '' && (
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-1">
                        out of 4.00
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* VALIDATION CHECK */}
                {letterGrade && letterGrade !== '' && (
                  <div>
                    {letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING ? (
                      <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                          ✅ {letterGrade.toUpperCase().trim()} → {gradePoints} GPA (CORRECT)
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                          ❌ "{letterGrade.toUpperCase().trim()}" is INVALID
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Valid grades: A+, A, A-, B+, B, B-, C+, C, D, F
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Grade Points Entry with Validation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Grade Points
                </label>
                <input
                  type="text"
                  placeholder="Should auto-fill based on grade"
                  value={manualGradePoints}
                  onChange={(e) => setManualGradePoints(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 transition ${
                    manualGradePoints === '' 
                      ? 'border-gray-300 dark:border-navy-600 focus:ring-blue-500'
                      : manualGradePoints === gradePoints && gradePoints !== ''
                      ? 'border-green-500 dark:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 dark:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                  }`}
                />
                {manualGradePoints && gradePoints && manualGradePoints !== gradePoints && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                    ❌ ERROR: Points should be {gradePoints} for {letterGrade.toUpperCase().trim()}, not {manualGradePoints}
                  </p>
                )}
                {manualGradePoints && gradePoints && manualGradePoints === gradePoints && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">
                    ✅ Perfect! Points match the grade.
                  </p>
                )}
                <p className={`text-xs mt-3 font-semibold px-2 ${
                  letterGrade === ''
                    ? 'text-gray-600 dark:text-gray-400'
                    : letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING
                    ? 'text-green-700 dark:text-green-300 flex items-center gap-1'
                    : 'text-red-700 dark:text-red-300 flex items-center gap-1'
                }`}>
                  {letterGrade === '' 
                    ? '→ Start by entering a letter grade (A+, A, B+, etc.)'
                    : letterGrade.toUpperCase().trim() in GRADE_POINT_MAPPING
                    ? `✅ Perfect! "${letterGrade.toUpperCase().trim()}" = ${gradePoints} GPA`
                    : `❌ "${letterGrade.toUpperCase().trim()}" is not a valid grade. Use: A+, A, A-, B+, B, B-, C+, C, D, F`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Type */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Assessment Type
            </h2>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-navy-600 rounded-xl dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="Final Score">Final Score</option>
              <option value="Midterm">Midterm Exam</option>
              <option value="Final Exam">Final Exam</option>
              <option value="Assignment">Assignment</option>
              <option value="Quiz">Quiz</option>
              <option value="Project">Project</option>
              <option value="Participation">Participation</option>
            </select>
          </div>

          {/* Mark As Completed */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={markCompleted}
                onChange={(e) => setMarkCompleted(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Mark enrollment as completed (move credits to completed status)
              </span>
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 ml-8">
              Check this if this is the final grade and the course should be marked as completed.
            </p>
          </div>

          {/* Validation Status */}
          <div className={`mb-6 p-4 rounded-xl border-2 text-sm font-semibold text-center transition-all ${
            formValid
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-300'
          }`}>
            {getValidationMessage()}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !formValid}
            className={`w-full py-4 font-bold rounded-xl transition-all transform shadow-lg ${
              formValid
                ? 'bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-black hover:scale-[1.02] active:scale-95 shadow-gold-500/30'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin w-5 h-5" />
                Submitting...
              </div>
            ) : formValid ? (
              '✅ Secure Submit Grade'
            ) : (
              '⚠️ Complete form to submit'
            )}
          </button>
        </motion.form>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-2">Grade Submission Info:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Grade points automatically calculated</strong> from letter grade</li>
                <li>Grades are saved to SQL Server database</li>
                <li>Student will see grades on their dashboard</li>
                <li>GPA automatically recalculated</li>
                <li>Credits moved to completed when enrollment marked complete</li>
                <li><strong>Grade Scale:</strong> A+:4.0, A:3.75, A-:3.5, B+:3.25, B:3.0, B-:2.75, C+:2.5, C:2.25, D:2.0, F:0.0</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SubmitGradePage;
