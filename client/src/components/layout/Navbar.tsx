import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Settings, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleLabel = {
    admin: 'Administrator',
    teacher: 'Teacher',
    student: 'Student',
  }

  return (
    <nav className="bg-surface-base dark:bg-surface-darkCard border-b border-border-light dark:border-border-dark-dark sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-brand-primary dark:bg-brand-accent rounded-lg flex items-center justify-center text-white font-bold group-hover:shadow-lg transition-shadow">
              EU
            </div>
            <span className="font-bold text-lg text-text-primary dark:text-text-dark-primary hidden sm:inline">
              Encrypt
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-text-secondary" />
              ) : (
                <Sun className="w-5 h-5 text-text-secondary" />
              )}
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary dark:bg-brand-accent flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                      {roleLabel[user.role]}
                    </p>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-card dark:bg-surface-darkCard rounded-lg shadow-lg border border-border-light dark:border-border-dark-dark">
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-3 text-sm text-text-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-semantic-error hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-border-light dark:border-border-dark-dark"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 border-t border-border-light dark:border-border-dark-dark">
            {user && (
              <div className="px-4 py-4 border-b border-border-light dark:border-border-dark-dark">
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {user.name}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {roleLabel[user.role]}
                </p>
              </div>
            )}
            <Link
              to="/settings"
              className="flex items-center space-x-2 px-4 py-3 text-sm text-text-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-semantic-error hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-border-light dark:border-border-dark-dark"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
