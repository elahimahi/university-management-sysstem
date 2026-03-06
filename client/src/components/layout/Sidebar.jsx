import React from 'react';
import { useAuth } from '../../providers/AuthProvider';

const Sidebar = ({ role }) => {
  // Example links, customize per role
  const links = {
    admin: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Settings', href: '/admin/settings' },
    ],
    teacher: [
      { label: 'Dashboard', href: '/teacher' },
      { label: 'Courses', href: '/teacher/courses' },
      { label: 'Attendance', href: '/teacher/attendance' },
    ],
    student: [
      { label: 'Dashboard', href: '/student' },
      { label: 'Courses', href: '/student/courses' },
      { label: 'Grades', href: '/student/grades' },
    ],
  };
  const navLinks = links[role] || [];

  return (
    <aside className="w-56 bg-white dark:bg-gray-800 h-screen sticky top-0 flex flex-col shadow-md">
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
