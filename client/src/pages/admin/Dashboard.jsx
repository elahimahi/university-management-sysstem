import React from 'react';
import StatCard from '../../ui/StatCard';
import SectionHeading from '../../ui/SectionHeading';
import Card from '../../ui/Card';

const AdminDashboard = () => {
  // Dummy stats for illustration
  const stats = [
    { label: 'Students', value: '1,200' },
    { label: 'Teachers', value: '80' },
    { label: 'Courses', value: '60' },
    { label: 'Active Offerings', value: '25' },
  ];

  return (
    <div>
      <SectionHeading>Admin Dashboard</SectionHeading>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>
      <Card className="mb-8">
        <div className="font-semibold text-lg mb-2">Welcome, Admin!</div>
        <div className="text-gray-600 text-sm">Manage departments, courses, semesters, users, and audit logs below.</div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
