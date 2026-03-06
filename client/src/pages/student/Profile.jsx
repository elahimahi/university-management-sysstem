import React from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const StudentProfile = () => {
  // Dummy data for illustration
  const profile = {
    name: 'Jane Doe',
    email: 'jane@student.edu',
    studentId: 'S123456',
    department: 'Computer Science',
    year: '3rd',
  };

  return (
    <div>
      <SectionHeading>Profile</SectionHeading>
      <Card className="max-w-lg mx-auto">
        <form className="space-y-4">
          <Input label="Name" value={profile.name} readOnly />
          <Input label="Email" value={profile.email} readOnly />
          <Input label="Student ID" value={profile.studentId} readOnly />
          <Input label="Department" value={profile.department} readOnly />
          <Input label="Year" value={profile.year} readOnly />
          <Button type="button" className="w-full" disabled>Update (Coming Soon)</Button>
        </form>
      </Card>
    </div>
  );
};

export default StudentProfile;
