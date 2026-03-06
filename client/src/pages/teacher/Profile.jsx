import React from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const TeacherProfile = () => {
  // Dummy data for illustration
  const profile = {
    name: 'Dr. John Smith',
    email: 'john@teacher.edu',
    teacherId: 'T987654',
    department: 'Mathematics',
    designation: 'Associate Professor',
  };

  return (
    <div>
      <SectionHeading>Profile</SectionHeading>
      <Card className="max-w-lg mx-auto">
        <form className="space-y-4">
          <Input label="Name" value={profile.name} readOnly />
          <Input label="Email" value={profile.email} readOnly />
          <Input label="Teacher ID" value={profile.teacherId} readOnly />
          <Input label="Department" value={profile.department} readOnly />
          <Input label="Designation" value={profile.designation} readOnly />
          <Button type="button" className="w-full" disabled>Update (Coming Soon)</Button>
        </form>
      </Card>
    </div>
  );
};

export default TeacherProfile;
