import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const dummyOfferings = [
  { id: 1, course: 'Calculus I', students: 40, pendingGrades: true },
  { id: 2, course: 'Linear Algebra', students: 35, pendingGrades: false },
  { id: 3, course: 'Statistics', students: 45, pendingGrades: true },
];

const OfferingsList = () => {
  const [offerings] = useState(dummyOfferings);

  return (
    <div>
      <SectionHeading>My Course Offerings</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {offerings.map((off) => (
          <Card key={off.id} className="flex flex-col gap-2">
            <div className="font-semibold text-lg">{off.course}</div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color="blue">{off.students} students</Badge>
              {off.pendingGrades && <Badge color="yellow">Pending Grades</Badge>}
            </div>
            <Button className="w-full" as="a" href={`/teacher/grade/${off.id}`}>Manage Grades</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OfferingsList;
