import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.service';
import { Button } from '../../components/common';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  category?: string;
  level?: string;
}

const FacultyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    category: '',
    level: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiService.get<{ status: string; courses?: Course[]; message?: string }>('/faculty/courses');
      if (response.status === 'success') {
        setCourses(response.courses || []);
      } else {
        throw new Error(response.message || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to fetch courses. Please make sure you are logged in as faculty.';
      toast.error(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Course code and name are required');
      return;
    }

    if (formData.credits < 1 || formData.credits > 6) {
      toast.error('Credits must be between 1 and 6');
      return;
    }

    try {
      const response = await apiService.post<{ status: string; message?: string; course?: Course }>('/faculty/courses', formData);
      if (response.status === 'success') {
        setCourses([...courses, response.course!]);
        setFormData({ code: '', name: '', credits: 3, category: '', level: '' });
        setShowForm(false);
        toast.success('Course added successfully');
      } else {
        toast.error(response.message || 'Failed to add course');
      }
    } catch (error: any) {
      console.error('Error adding course:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add course';
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 p-8 flex items-center justify-center">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-navy-950 dark:via-navy-900 dark:to-navy-850 p-8"
    >
      <div className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-sky-600 to-cyan-500 p-8 shadow-[0_35px_120px_rgba(14,165,233,0.18)] mb-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/90 mb-3">Faculty dashboard</p>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white">My Courses</h1>
              <p className="mt-4 max-w-2xl text-white/85 text-base lg:text-lg">
                Beautiful course overview with animated cards, instant course creation, and quick access to your teaching roster.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
              <Button onClick={() => setShowForm(!showForm)} className="min-w-[12rem]" variant="primary">
                {showForm ? 'Cancel' : 'Add Course'}
              </Button>
              <div className="rounded-3xl border border-white/20 bg-white/10 px-5 py-4 text-white shadow-xl backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Courses</p>
                <p className="mt-2 text-3xl font-semibold">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-6 bg-white/90 dark:bg-navy-900/90 rounded-[2rem] border border-slate-200 dark:border-navy-700 shadow-[0_30px_80px_rgba(15,23,42,0.08)]"
        >
          <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Credits</label>
                <select
                  name="credits"
                  value={formData.credits}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Core, Elective"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <input
                  type="text"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Undergraduate, Graduate"
                />
              </div>
            </div>
            <Button type="submit">Add Course</Button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="rounded-[2rem] border border-slate-200 bg-white/90 dark:bg-navy-900/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] hover:shadow-[0_30px_90px_rgba(15,23,42,0.15)] transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
            <p className="text-md text-gray-600 dark:text-gray-300 mb-2">Code: {course.code}</p>
            <p className="text-md text-gray-600 dark:text-gray-300 mb-2">Credits: {course.credits}</p>
            {course.category && <p className="text-md text-gray-600 dark:text-gray-300 mb-2">Category: {course.category}</p>}
            {course.level && <p className="text-md text-gray-600 dark:text-gray-300">Level: {course.level}</p>}
          </motion.div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-gray-500 dark:text-gray-400">No courses found. Add your first course above.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FacultyCoursesPage;
