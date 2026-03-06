import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Skeleton from '../../ui/Skeleton';
import EmptyState from '../../ui/EmptyState';
import api from '../../lib/api';

const schema = z.object({
  name: z.string().min(2, 'Course name required'),
  department: z.string().min(2, 'Department required'),
});

export default function CreateCourseForm({ onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/admin/courses', data),
    onSuccess,
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
      <Input label="Course Name" {...register('name')} error={errors.name?.message} />
      <Input label="Department" {...register('department')} error={errors.department?.message} />
      {mutation.isError && <div className="text-red-600 text-sm">{mutation.error?.response?.data?.message || 'Creation failed'}</div>}
      <Button type="submit" disabled={mutation.isLoading} className="w-full">
        {mutation.isLoading ? <Skeleton className="h-6 w-20 mx-auto" /> : 'Create Course'}
      </Button>
    </form>
  );
}
