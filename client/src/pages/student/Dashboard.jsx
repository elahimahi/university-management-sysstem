import React from 'react';
import StatCard from '../../ui/StatCard';
import SectionHeading from '../../ui/SectionHeading';
import Card from '../../ui/Card';

const StudentDashboard = () => {
  // Dummy stats for illustration
  const stats = [
    { label: 'Current GPA', value: '3.82' },
    { label: 'Enrolled Courses', value: '5' },
    { label: 'Completed Credits', value: '90' },
    { label: 'Attendance Rate', value: '97%' },
  ];

  return (
    <div>
      <SectionHeading>Student Dashboard</SectionHeading>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
      <Card className="mb-8">
        <div className="font-semibold text-lg mb-2">Welcome back!</div>
        <div className="text-gray-600 text-sm">Check your enrollments, results, and new course opportunities below.</div>
      </Card>
    </div>
  );
};

export default StudentDashboard;
