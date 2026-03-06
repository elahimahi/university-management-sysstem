import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';

const dummyStudents = [
  { id: 1, name: 'Alice Johnson', enrollmentId: 101, grade: '', preview: '' },
  { id: 2, name: 'Bob Lee', enrollmentId: 102, grade: '', preview: '' },
  { id: 3, name: 'Carlos Smith', enrollmentId: 103, grade: '', preview: '' },
];

const Grade = () => {
  const [students, setStudents] = useState(dummyStudents);
  const [submitted, setSubmitted] = useState(false);

  const handleGradeChange = (id, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, grade: value, preview: value } : s))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <SectionHeading>Grade Submission</SectionHeading>
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold">{student.name}</div>
                <div className="text-xs text-gray-400">Enrollment #{student.enrollmentId}</div>
              </div>
              <input
                type="text"
                value={student.grade}
                onChange={(e) => handleGradeChange(student.id, e.target.value)}
                placeholder="Grade (e.g. A, B+)"
                className="border rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Grade for ${student.name}`}
              />
              <Badge color="blue">{student.preview || 'Preview'}</Badge>
            </div>
          ))}
          <Button type="submit" className="w-full">Submit Grades</Button>
          {submitted && <div className="text-green-600 font-semibold text-center">Grades submitted!</div>}
        </form>
      </Card>
    </div>
  );
};

export default Grade;
