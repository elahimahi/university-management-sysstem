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
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  studentId: z.string().min(1, 'Student ID required'),
  department: z.string().min(2, 'Department required'),
  year: z.string().min(1, 'Year required'),
});

export default function StudentProfileForm() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => api.get('/student/profile').then(res => res.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const mutation = useMutation({
    mutationFn: (form) => api.put('/student/profile', form),
    onSuccess: () => {},
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (isError) return <EmptyState title="Error" description="Could not load profile." />;
  if (!data) return <EmptyState title="No Data" description="Profile not found." />;

  const onSubmit = (form) => mutation.mutate(form);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input label="Email" {...register('email')} error={errors.email?.message} />
      <Input label="Student ID" {...register('studentId')} error={errors.studentId?.message} />
      <Input label="Department" {...register('department')} error={errors.department?.message} />
      <Input label="Year" {...register('year')} error={errors.year?.message} />
      {mutation.isError && <div className="text-red-600 text-sm">{mutation.error?.response?.data?.message || 'Update failed'}</div>}
      <Button type="submit" disabled={mutation.isLoading} className="w-full">
        {mutation.isLoading ? <Skeleton className="h-6 w-20 mx-auto" /> : 'Update Profile'}
      </Button>
    </form>
  );
}
