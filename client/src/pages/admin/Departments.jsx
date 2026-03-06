import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const initialDepartments = [
  { id: 1, name: 'Computer Science' },
  { id: 2, name: 'Mathematics' },
  { id: 3, name: 'Physics' },
];

const Departments = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [newDept, setNewDept] = useState('');

  const handleAdd = () => {
    if (!newDept.trim()) return;
    setDepartments([...departments, { id: Date.now(), name: newDept }]);
    setNewDept('');
  };

  const handleDelete = (id) => {
    setDepartments(departments.filter((d) => d.id !== id));
  };

  return (
    <div>
      <SectionHeading>Departments</SectionHeading>
      <Card className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2 mb-4">
          <Input
            label="Add Department"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <ul className="divide-y">
          {departments.map((dept) => (
            <li key={dept.id} className="flex items-center justify-between py-2">
              <span>{dept.name}</span>
              <Button onClick={() => handleDelete(dept.id)} color="red" size="sm">Delete</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Departments;
