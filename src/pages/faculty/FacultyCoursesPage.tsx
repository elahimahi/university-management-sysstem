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
      className="min-h-screen bg-white dark:bg-navy-900 p-8"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">My Courses</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">View and manage all courses you are teaching.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Course'}
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-6 bg-gray-50 dark:bg-navy-800 rounded-lg"
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
            whileHover={{ scale: 1.03 }}
            className="rounded-xl shadow-lg bg-gradient-to-br from-primary-50 to-white dark:from-navy-800 dark:to-navy-900 p-6 border border-primary-100 dark:border-navy-700"
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
