import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface PublicLayoutProps {
  children: React.ReactNode
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-base dark:bg-surface-darkBase">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {children}
        </div>
      </main>
      <Footer variant="classic" />
    </div>
  )
}
