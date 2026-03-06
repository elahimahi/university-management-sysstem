import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  BookOpen,
  Clock,
  Building,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
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
import { adminAPI } from '@/api'

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminAPI.getStats()
      return response.data as { total_students: number; total_teachers: number; total_courses: number; active_offerings: number }
    },
  })

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load dashboard statistics" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Admin Dashboard"
          subtitle="Overview of Encrypt University"
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : (
            <>
              <StatCard
                icon={<Users />}
                label="Total Students"
                value={stats?.total_students || 0}
                color="primary"
              />
              <StatCard
                icon={<Users />}
                label="Total Teachers"
                value={stats?.total_teachers || 0}
                color="accent"
              />
              <StatCard
                icon={<BookOpen />}
                label="Total Courses"
                value={stats?.total_courses || 0}
                color="success"
              />
              <StatCard
                icon={<Clock />}
                label="Active Offerings"
                value={stats?.active_offerings || 0}
                color="warning"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
                <Building className="w-5 h-5 text-brand-primary dark:text-brand-accent-light" />
                <span>Departments</span>
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                Manage academic departments and their heads
              </p>
              <a
                href="/admin/departments"
                className="text-brand-primary dark:text-brand-accent-light hover:underline font-medium"
              >
                View Departments →
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-brand-primary dark:text-brand-accent-light" />
                <span>Courses</span>
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                Create and manage course catalog
              </p>
              <a
                href="/admin/courses"
                className="text-brand-primary dark:text-brand-accent-light hover:underline font-medium"
              >
                View Courses →
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-primary dark:text-brand-accent-light" />
                <span>Semesters</span>
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                Create and configure academic semesters
              </p>
              <a
                href="/admin/semesters"
                className="text-brand-primary dark:text-brand-accent-light hover:underline font-medium"
              >
                View Semesters →
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-brand-primary dark:text-brand-accent-light" />
                <span>Audit Logs</span>
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                View system activity and audit trail
              </p>
              <a
                href="/admin/audit-logs"
                className="text-brand-primary dark:text-brand-accent-light hover:underline font-medium"
              >
                View Logs →
              </a>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Recent Activity</span>
            </h3>
          </CardHeader>
          <CardBody>
            <p className="text-text-secondary dark:text-text-dark-secondary">
              No recent activity to display
            </p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
