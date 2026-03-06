import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, BarChart3, TrendingUp } from 'lucide-react'
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
import { studentAPI } from '@/api'

const StudentDashboard: React.FC = () => {
  const { data: enrollments, isLoading: enrollmentsLoading, error: enrollmentsError } = useQuery({
    queryKey: ['student', 'enrollments'],
    queryFn: async () => {
      const response = await studentAPI.getEnrollments()
      return response.data as any[]
    },
  })

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['student', 'results'],
    queryFn: async () => {
      const response = await studentAPI.getResults()
      return response.data as any[]
    },
  })

  if (enrollmentsError) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load dashboard" />
      </DashboardLayout>
    )
  }

  const enrollmentCount = enrollments?.length || 0
  const completedResults = results?.filter((r: any) => r.grade)?.length || 0
  const gpa = results && results.length > 0
    ? (results.reduce((sum: number, r: any) => sum + (r.gpa_points || 0), 0) / results.length).toFixed(2)
    : '3.5'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Student Dashboard"
          subtitle="Your academic progress"
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {enrollmentsLoading ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : (
            <>
              <StatCard
                icon={<BookOpen />}
                label="Enrolled Courses"
                value={enrollmentCount}
                color="primary"
              />
              <StatCard
                icon={<BarChart3 />}
                label="Completed Courses"
                value={completedResults}
                color="success"
              />
              <StatCard
                icon={<TrendingUp />}
                label="Current GPA"
                value={gpa}
                color="accent"
              />
            </>
          )}
        </div>

        {/* Current Enrollments */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              Current Enrollments
            </h3>
          </CardHeader>
          <CardBody>
            {enrollmentsLoading ? (
              <Skeleton count={3} className="h-20 mb-4" />
            ) : enrollments && enrollments.length > 0 ? (
              <div className="space-y-4">
                {enrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-text-primary dark:text-text-dark-primary">
                        {enrollment.offering?.course?.title || 'Course'}
                      </h4>
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                        {enrollment.offering?.course?.code || 'N/A'} • {enrollment.status}
                      </p>
                    </div>
                    <a
                      href={`/student/results?enrollment=${enrollment.id}`}
                      className="text-brand-primary dark:text-brand-accent-light hover:underline text-sm font-medium"
                    >
                      View Result →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary dark:text-text-dark-secondary">
                No enrollments found. Start enrolling in courses!
              </p>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hoverable clickable>
            <CardBody>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
                Explore Courses
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Browse and enroll in available course offerings
              </p>
              <a
                href="/student/enrollments"
                className="text-brand-primary dark:text-brand-accent-light hover:underline text-sm font-medium mt-4 inline-block"
              >
                View Offerings →
              </a>
            </CardBody>
          </Card>

          <Card hoverable clickable>
            <CardBody>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
                Your Results
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                View your grades and academic performance
              </p>
              <a
                href="/student/results"
                className="text-brand-primary dark:text-brand-accent-light hover:underline text-sm font-medium mt-4 inline-block"
              >
                View Results →
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard
