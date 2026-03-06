import React, { useState } from 'react';
import Card from '../../ui/Card';
import SectionHeading from '../../ui/SectionHeading';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const initialUsers = [
  { id: 1, name: 'Alice', role: 'Student' },
  { id: 2, name: 'Bob', role: 'Teacher' },
  { id: 3, name: 'Carol', role: 'Admin' },
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [newUser, setNewUser] = useState('');
  const [newRole, setNewRole] = useState('Student');

  const handleAdd = () => {
    if (!newUser.trim()) return;
    setUsers([...users, { id: Date.now(), name: newUser, role: newRole }]);
    setNewUser('');
    setNewRole('Student');
  };

  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div>
      <SectionHeading>Users</SectionHeading>
      <Card className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2 mb-4">
          <Input
            label="User Name"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            className="flex-1"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Role"
          >
            <option>Student</option>
            <option>Teacher</option>
            <option>Admin</option>
          </select>
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <ul className="divide-y">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between py-2">
              <span>{user.name} <span className="text-xs text-gray-400">({user.role})</span></span>
              <Button onClick={() => handleDelete(user.id)} color="red" size="sm">Delete</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Users;
