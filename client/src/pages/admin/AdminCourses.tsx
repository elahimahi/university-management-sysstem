import React from 'react'
import { DashboardLayout } from '@/components/layout'
import { SectionHeading, EmptyState, Button } from '@/components/ui'
import { Plus } from 'lucide-react'

const AdminCourses: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Courses"
          subtitle="Manage course catalog"
          action={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          }
        />
        <EmptyState title="No courses found" description="Create your first course to get started" />
      </div>
    </DashboardLayout>
  )
}

export default AdminCourses
