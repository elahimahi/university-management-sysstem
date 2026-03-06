import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import {
  SectionHeading,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Skeleton,
  EmptyState,
  Alert,
} from '@/components/ui'
import { teacherAPI } from '@/api'
import { Plus, Users } from 'lucide-react'

const TeacherOfferings: React.FC = () => {
  const { data: offerings, isLoading, error } = useQuery({
    queryKey: ['teacher', 'offerings'],
    queryFn: async () => {
      const response = await teacherAPI.getOfferings()
      return (response.data as any) || [] as any[]
    },
  })

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load offerings" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="My Course Offerings"
          subtitle="Manage your assigned courses"
          action={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Offering
            </Button>
          }
        />

        {isLoading ? (
          <Skeleton count={3} className="h-48 mb-4" />
        ) : offerings && offerings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offerings.map((offering: any) => (
              <Card key={offering.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                        {offering.course?.title}
                      </h3>
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                        {offering.course?.code}
                      </p>
                    </div>
                    <Badge variant="primary">
                      {offering.semester?.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-secondary dark:text-text-dark-secondary">
                        {offering.current_seats} / {offering.max_seats} students
                      </span>
                    </div>
                    {offering.location && (
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                        Location: {offering.location}
                      </p>
                    )}
                    {offering.schedule && (
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                        Schedule: {offering.schedule}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Students
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No course offerings"
            description="Your course offerings will appear here"
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export default TeacherOfferings
