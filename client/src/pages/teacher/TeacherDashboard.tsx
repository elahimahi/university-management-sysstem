import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, TrendingUp } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import {
  SectionHeading,
  StatCard,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Alert,
} from '@/components/ui'
import { teacherAPI } from '@/api'

const TeacherDashboard: React.FC = () => {
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
        <Alert variant="error" message="Failed to load dashboard" />
      </DashboardLayout>
    )
  }

  const totalOfferings = offerings?.length || 0
  const totalStudents = offerings?.reduce((sum: number, o: any) => sum + (o.current_seats || 0), 0) || 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Teacher Dashboard"
          subtitle="Manage your courses and grades"
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : (
            <>
              <StatCard
                icon={<BookOpen />}
                label="Assigned Offerings"
                value={totalOfferings}
                color="primary"
              />
              <StatCard
                icon={<Users />}
                label="Total Students"
                value={totalStudents}
                color="accent"
              />
              <StatCard
                icon={<TrendingUp />}
                label="Grades Submitted"
                value={0}
                color="success"
              />
            </>
          )}
        </div>

        {/* My Offerings */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              Your Course Offerings
            </h3>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton count={3} className="h-20 mb-4" />
            ) : offerings && offerings.length > 0 ? (
              <div className="space-y-4">
                {offerings.map((offering: any) => (
                  <div
                    key={offering.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-text-primary dark:text-text-dark-primary">
                        {offering.course?.title}
                      </h4>
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                        {offering.course?.code} • {offering.current_seats} students enrolled
                      </p>
                    </div>
                    <a
                      href={`/teacher/grade/${offering.id}`}
                      className="text-brand-primary dark:text-brand-accent-light hover:underline text-sm font-medium"
                    >
                      Grade →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary dark:text-text-dark-secondary">
                No course offerings assigned
              </p>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable clickable>
            <CardBody>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
                View Enrollments
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                See who is enrolled in your courses
              </p>
            </CardBody>
          </Card>

          <Card hoverable clickable>
            <CardBody>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
                Submit Grades
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Record student marks and grades
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TeacherDashboard
