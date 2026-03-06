import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import {
  SectionHeading,
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Skeleton,
  Alert,
} from '@/components/ui'
import { teacherAPI } from '@/api'

const TeacherProfile: React.FC = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: async () => {
      const response = await teacherAPI.getProfile()
      return (response.data as any) || {} as { name: string; email: string }
    },
  })

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load profile" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading title="Teacher Profile" subtitle="Your account information" />

        {isLoading ? (
          <Skeleton count={5} className="h-16 mb-4" />
        ) : (
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary">
                Profile Information
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input label="Name" value={profile?.name} disabled />
                <Input label="Email" type="email" value={profile?.email} disabled />
                <Input label="Role" value="Teacher" disabled />
                <div className="flex gap-4 pt-4">
                  <Button>Edit Profile</Button>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TeacherProfile
