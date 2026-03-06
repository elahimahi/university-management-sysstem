import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-base dark:bg-surface-darkBase">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
