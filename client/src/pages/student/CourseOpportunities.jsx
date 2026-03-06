import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const dummyCourses = [
  { id: 1, name: 'Algorithms', instructor: 'Dr. Smith', seats: 2, enrolled: false },
  { id: 2, name: 'Database Systems', instructor: 'Prof. Lee', seats: 0, enrolled: false },
  { id: 3, name: 'Operating Systems', instructor: 'Dr. Kim', seats: 5, enrolled: true },
];

const CourseOpportunities = () => {
  const [courses, setCourses] = useState(dummyCourses);

  const handleEnroll = (id) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id && c.seats > 0 && !c.enrolled
          ? { ...c, enrolled: true, seats: c.seats - 1 }
          : c
      )
    );
  };

  return (
    <div>
      <SectionHeading>Course Opportunities</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col gap-2">
            <div className="font-semibold text-lg">{course.name}</div>
            <div className="text-gray-500 text-sm mb-2">Instructor: {course.instructor}</div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color={course.seats > 0 ? 'green' : 'red'}>
                {course.seats > 0 ? `${course.seats} seats left` : 'Full'}
              </Badge>
              {course.enrolled && <Badge color="blue">Enrolled</Badge>}
            </div>
            <Button
              disabled={course.seats === 0 || course.enrolled}
              onClick={() => handleEnroll(course.id)}
              className="w-full"
            >
              {course.enrolled ? 'Enrolled' : 'Enroll'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseOpportunities;
