import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import {
  SectionHeading,
  Card,
  CardBody,
  Badge,
  Skeleton,
  EmptyState,
  Alert,
} from '@/components/ui'
import { studentAPI } from '@/api'

const gradeColor = (grade?: string) => {
  switch (grade) {
    case 'A':
    case 'A+':
      return 'success'
    case 'B':
    case 'B+':
      return 'info'
    case 'C':
    case 'C+':
      return 'warning'
    default:
      return 'error'
  }
}

const StudentResults: React.FC = () => {
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['student', 'results'],
    queryFn: async () => {
      const response = await studentAPI.getResults()
      return response.data as any[]
    },
  })

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load results" />
      </DashboardLayout>
    )
  }

  const gpa = results && results.length > 0
    ? (results.reduce((sum: number, r: any) => sum + (r.gpa_points || 0), 0) / results.length).toFixed(2)
    : '0.00'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Academic Results"
          subtitle="Your grades and academic performance"
        />

        {isLoading ? (
          <Skeleton count={5} className="h-20 mb-4" />
        ) : results && results.length > 0 ? (
          <>
            {/* Overall GPA Card */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary dark:text-text-dark-secondary text-sm mb-1">
                      Overall GPA
                    </p>
                    <p className="text-4xl font-bold text-brand-primary dark:text-brand-accent-light">
                      {gpa}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary dark:text-text-dark-secondary text-sm mb-1">
                      Total Courses Completed
                    </p>
                    <p className="text-4xl font-bold text-text-primary dark:text-text-dark-primary">
                      {results.length}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light dark:border-border-dark-dark">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                      Code
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                      GPA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result: any) => (
                    <tr
                      key={result.id}
                      className="border-b border-border-light dark:border-border-dark-dark hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 text-sm text-text-primary dark:text-text-dark-primary">
                        {result.enrollment?.offering?.course?.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary dark:text-text-dark-secondary">
                        {result.enrollment?.offering?.course?.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-text-primary dark:text-text-dark-primary">
                        {result.marks_obtained || 'N/A'} / {result.total_marks}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {result.grade ? (
                          <Badge variant={gradeColor(result.grade)}>
                            {result.grade}
                          </Badge>
                        ) : (
                          <span className="text-text-secondary dark:text-text-dark-secondary">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-medium text-text-primary dark:text-text-dark-primary">
                        {result.gpa_points?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState title="No results found" description="Your grades will appear here once they are published" />
        )}
      </div>
    </DashboardLayout>
  )
}

export default StudentResults
