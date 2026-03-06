import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
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
import { studentAPI } from '@/api'
import { CourseOffering } from '@/types'

const StudentEnrollments: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null)

  const { data: offerings, isLoading, error } = useQuery({
    queryKey: ['student', 'offerings'],
    queryFn: async () => {
      const response = await studentAPI.getOfferings()
      return response.data as CourseOffering[]
    },
  })

  const enrollMutation = useMutation({
    mutationFn: (offering_id: number) => studentAPI.enroll(offering_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['student', 'offerings'] })
      setSelectedOffering(null)
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
          title="Available Courses"
          subtitle="Browse and enroll in course offerings"
        />

        {isLoading ? (
          <Skeleton count={5} className="h-40 mb-4" />
        ) : offerings && offerings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offerings.map((offering: CourseOffering) => (
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
                    <Badge variant="primary">{offering.course?.credit_hours} Credits</Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                        Instructor
                      </p>
                      <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                        {offering.teacher?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                        Available Seats
                      </p>
                      <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                        {offering.max_seats - offering.current_seats} / {offering.max_seats}
                      </p>
                    </div>
                    {offering.schedule && (
                      <div>
                        <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                          Schedule
                        </p>
                        <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                          {offering.schedule}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => enrollMutation.mutate(offering.id)}
                    isLoading={enrollMutation.isPending && selectedOffering === offering.id}
                    disabled={offering.max_seats - offering.current_seats === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {offering.max_seats - offering.current_seats === 0 ? 'Seats Full' : 'Enroll'}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No offerings available" description="Check back later for new course offerings" />
        )}
      </div>
    </DashboardLayout>
  )
}

export default StudentEnrollments
