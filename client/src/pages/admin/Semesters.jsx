import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const initialSemesters = [
  { id: 1, name: 'Spring 2026' },
  { id: 2, name: 'Fall 2025' },
];

const Semesters = () => {
  const [semesters, setSemesters] = useState(initialSemesters);
  const [newSem, setNewSem] = useState('');

  const handleAdd = () => {
    if (!newSem.trim()) return;
    setSemesters([...semesters, { id: Date.now(), name: newSem }]);
    setNewSem('');
  };

  const handleDelete = (id) => {
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  return (
    <div>
      <SectionHeading>Semesters</SectionHeading>
      <Card className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2 mb-4">
          <Input
            label="Add Semester"
            value={newSem}
            onChange={(e) => setNewSem(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <ul className="divide-y">
          {semesters.map((sem) => (
            <li key={sem.id} className="flex items-center justify-between py-2">
              <span>{sem.name}</span>
              <Button onClick={() => handleDelete(sem.id)} color="red" size="sm">Delete</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Semesters;
