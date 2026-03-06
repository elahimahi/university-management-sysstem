import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import {
  SectionHeading,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Input,
  Textarea,
  Alert,
  Skeleton,
  EmptyState,
} from '@/components/ui'
import { adminAPI } from '@/api'

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
})

type DepartmentForm = z.infer<typeof departmentSchema>

const AdminDepartments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
  })

  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: async () => {
      const response = await adminAPI.getDepartments()
      return response.data as any[]
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: DepartmentForm) => adminAPI.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })
      setIsModalOpen(false)
      reset()
    },
  })

  const onSubmit = async (data: DepartmentForm) => {
    try {
      await createMutation.mutateAsync(data)
    } catch (error) {
      console.error('Failed to create department', error)
    }
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load departments" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <SectionHeading
          title="Departments"
          subtitle="Manage academic departments"
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          }
        />

        {isLoading ? (
          <Skeleton count={5} className="h-20 mb-4" />
        ) : departments && departments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept: any) => (
              <Card key={dept.id}>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                    {dept.name}
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                    {dept.description || 'No description provided'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No departments found" description="Create your first department to get started" />
        )}

        {/* Create Department Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Department"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create
              </Button>
            </>
          }
        >
          <form className="space-y-4">
            <Input
              label="Department Name"
              placeholder="e.g., Computer Science"
              {...register('name')}
              error={errors.name?.message}
            />
            <Textarea
              label="Description"
              placeholder="Department description"
              {...register('description')}
              error={errors.description?.message}
            />
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default AdminDepartments
