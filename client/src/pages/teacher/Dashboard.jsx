import React from 'react';
import StatCard from '../../ui/StatCard';
import SectionHeading from '../../ui/SectionHeading';
import Card from '../../ui/Card';

const TeacherDashboard = () => {
  // Dummy stats for illustration
  const stats = [
    { label: 'Courses Offered', value: '3' },
    { label: 'Students Enrolled', value: '120' },
    { label: 'Pending Grades', value: '2' },
    { label: 'Attendance Rate', value: '95%' },
  ];

  return (
    <div>
      <SectionHeading>Teacher Dashboard</SectionHeading>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
      <Card className="mb-8">
        <div className="font-semibold text-lg mb-2">Welcome back!</div>
        <div className="text-gray-600 text-sm">Manage your course offerings, students, and grade submissions below.</div>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
