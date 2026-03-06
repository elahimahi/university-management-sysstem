import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    <Footer />
  </div>
);

export default PublicLayout;
