import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Clock,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export const Sidebar: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)

  const navItems = {
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Departments', href: '/admin/departments', icon: Building },
      { label: 'Students', href: '/admin/users', icon: Users },
      { label: 'Teachers', href: '/admin/users', icon: Users },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Semesters', href: '/admin/semesters', icon: Clock },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
    teacher: [
      { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
      { label: 'Profile', href: '/teacher/profile', icon: Users },
      { label: 'Offerings', href: '/teacher/offerings', icon: BookOpen },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
    student: [
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Profile', href: '/student/profile', icon: Users },
      { label: 'Enrollments', href: '/student/enrollments', icon: BookOpen },
      { label: 'Results', href: '/student/results', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  }

  const items = user ? navItems[user.role] || [] : []

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden p-2 bg-brand-primary text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-64 bg-surface-card dark:bg-surface-darkCard
          border-r border-border-light dark:border-border-dark-dark
          overflow-y-auto
          transition-transform transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          z-40
        `}
      >
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-brand-primary text-white dark:bg-brand-accent'
                      : 'text-text-primary dark:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

// Import Building icon
const Building = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
    />
  </svg>
)
