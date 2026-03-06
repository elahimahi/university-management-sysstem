import React from 'react'
import { DashboardLayout } from '@/components/layout'
import { SectionHeading, EmptyState, Button } from '@/components/ui'
import { Plus } from 'lucide-react'

const AdminSemesters: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Semesters"
          subtitle="Create and manage academic semesters"
          action={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Semester
            </Button>
          }
        />
        <EmptyState
          title="No semesters found"
          description="Create your first semester to get started"
        />
      </div>
    </DashboardLayout>
  )
}

export default AdminSemesters
