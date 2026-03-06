import React from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';

const dummyResults = [
  { id: 1, course: 'Algorithms', grade: 'A', gpa: 4.0 },
  { id: 2, course: 'Operating Systems', grade: 'A-', gpa: 3.7 },
  { id: 3, course: 'Database Systems', grade: 'B+', gpa: 3.3 },
];

const Results = () => {
  const gpa = (
    dummyResults.reduce((acc, r) => acc + r.gpa, 0) / dummyResults.length
  ).toFixed(2);

  return (
    <div>
      <SectionHeading>Results</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {dummyResults.map((res) => (
          <Card key={res.id} className="flex flex-col gap-2">
            <div className="font-semibold text-lg">{res.course}</div>
            <div className="text-gray-500 text-sm">Grade: {res.grade}</div>
            <div className="text-gray-400 text-xs">GPA: {res.gpa}</div>
          </Card>
        ))}
      </div>
      <Card className="max-w-xs mx-auto text-center">
        <div className="font-bold text-lg">Cumulative GPA</div>
        <div className="text-2xl text-blue-700 dark:text-blue-300 font-extrabold">{gpa}</div>
      </Card>
    </div>
  );
};

export default Results;
