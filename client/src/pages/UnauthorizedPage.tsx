import React from 'react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui'
import { Shield } from 'lucide-react'

const UnauthorizedPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="w-24 h-24 text-semantic-error mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-8 max-w-md">
            You don't have permission to access this page. Please contact your administrator if you
            believe this is a mistake.
          </p>
          <Link to="/">
            <Button size="lg">Go Back Home</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default UnauthorizedPage
