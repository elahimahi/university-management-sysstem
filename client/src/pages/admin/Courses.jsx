import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const initialCourses = [
  { id: 1, name: 'Algorithms', department: 'Computer Science' },
  { id: 2, name: 'Linear Algebra', department: 'Mathematics' },
];

const Courses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [newCourse, setNewCourse] = useState('');
  const [newDept, setNewDept] = useState('');

  const handleAdd = () => {
    if (!newCourse.trim() || !newDept.trim()) return;
    setCourses([...courses, { id: Date.now(), name: newCourse, department: newDept }]);
    setNewCourse('');
    setNewDept('');
  };

  const handleDelete = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  return (
    <div>
      <SectionHeading>Courses</SectionHeading>
      <Card className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2 mb-4">
          <Input
            label="Course Name"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            className="flex-1"
          />
          <Input
            label="Department"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <ul className="divide-y">
          {courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between py-2">
              <span>{course.name} <span className="text-xs text-gray-400">({course.department})</span></span>
              <Button onClick={() => handleDelete(course.id)} color="red" size="sm">Delete</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Courses;
