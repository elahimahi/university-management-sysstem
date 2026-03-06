import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout'
import {
  SectionHeading,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Skeleton,
  Alert,
} from '@/components/ui'
import { studentAPI } from '@/api'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const StudentProfile: React.FC = () => {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: async () => {
      const response = await studentAPI.getProfile()
      return (response.data as any) || {} as { name: string; email: string; roll?: string; phone?: string; bio?: string }
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      await studentAPI.updateProfile(data)
    } catch (error) {
      console.error('Failed to update profile', error)
    }
  }

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
        <SectionHeading title="Student Profile" subtitle="Manage your account information" />

        {isLoading ? (
          <Skeleton count={5} className="h-16 mb-4" />
        ) : (
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary">
                Basic Information
              </h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    defaultValue={profile?.name}
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={profile?.email}
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Roll Number"
                    disabled
                    defaultValue={profile?.roll || 'N/A'}
                  />
                  <Input
                    label="Phone Number"
                    defaultValue={profile?.phone || ''}
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>

                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself"
                  defaultValue={profile?.bio || ''}
                  {...register('bio')}
                  error={errors.bio?.message}
                />

                <div className="flex gap-4">
                  <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default StudentProfile
