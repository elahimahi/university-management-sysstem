import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const TeacherLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
    <Sidebar role="teacher" />
    <div className="flex-1 flex flex-col">
      <Topbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);

export default TeacherLayout;
