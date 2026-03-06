import React from 'react'
import Navbar from './Navbar'

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

      {/* Footer */}
      <footer className="bg-surface-card dark:bg-surface-darkCard border-t border-border-light dark:border-border-dark-dark mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-text-primary dark:text-text-dark-primary mb-4">
                Encrypt University
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
                Secure Academic Management Platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                <li><a href="#" className="hover:text-brand-primary">Features</a></li>
                <li><a href="#" className="hover:text-brand-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-primary">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                <li><a href="#" className="hover:text-brand-primary">About</a></li>
                <li><a href="#" className="hover:text-brand-primary">Blog</a></li>
                <li><a href="#" className="hover:text-brand-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                <li><a href="#" className="hover:text-brand-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-brand-primary">Terms</a></li>
                <li><a href="#" className="hover:text-brand-primary">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border-light dark:border-border-dark-dark pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              © 2024 Encrypt University. All rights reserved.
            </p>
            <div className="text-sm text-text-secondary dark:text-text-dark-secondary">
              <p>Email: <a href="mailto:fazle.cse.20230104053@aust.edu" className="text-brand-primary hover:underline">fazle.cse.20230104053@aust.edu</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
