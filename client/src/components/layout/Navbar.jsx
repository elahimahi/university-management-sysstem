
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SunIcon, MoonIcon, UserCircleIcon, LogoutIcon } from '@heroicons/react/outline';

const prefersDark = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
};

const Navbar = () => {
  const [dark, setDark] = useState(prefersDark());
  const { user, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow flex items-center justify-between px-6 py-3" aria-label="Main navigation">
      <h1 className="font-bold text-lg text-blue-600 dark:text-blue-300">University System</h1>
      <div className="flex items-center gap-4">
        <button
          aria-label="Toggle dark mode"
          onClick={toggleDark}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded transition-colors"
        >
          {dark ? <SunIcon className="w-6 h-6 text-yellow-400 transition-transform duration-300 motion-reduce:transition-none" /> : <MoonIcon className="w-6 h-6 text-gray-600 transition-transform duration-300 motion-reduce:transition-none" />}
        </button>
        {user && (
          <div className="relative group">
            <button
              aria-label="Profile menu"
              className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              tabIndex={0}
            >
              <UserCircleIcon className="w-7 h-7 text-gray-500 dark:text-gray-300" />
              <span className="hidden sm:inline text-sm">{user.name}</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded shadow-lg py-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity motion-reduce:transition-none">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                tabIndex={0}
              >
                <LogoutIcon className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
