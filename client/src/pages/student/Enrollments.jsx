import React from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Badge from '../../ui/Badge';

const dummyEnrollments = [
  { id: 1, course: 'Algorithms', status: 'Active', credits: 3 },
  { id: 2, course: 'Operating Systems', status: 'Active', credits: 3 },
  { id: 3, course: 'Database Systems', status: 'Completed', credits: 3 },
];

const Enrollments = () => (
  <div>
    <SectionHeading>My Enrollments</SectionHeading>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dummyEnrollments.map((enr) => (
        <Card key={enr.id} className="flex flex-col gap-2">
          <div className="font-semibold text-lg">{enr.course}</div>
          <div className="flex items-center gap-2 mb-2">
            <Badge color={enr.status === 'Active' ? 'green' : 'gray'}>{enr.status}</Badge>
            <span className="text-xs text-gray-400">{enr.credits} credits</span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default Enrollments;
