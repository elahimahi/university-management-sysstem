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
  courseId: z.string().min(1, 'Course required'),
  semester: z.string().min(1, 'Semester required'),
  seats: z.number().min(1, 'At least 1 seat'),
});

export default function CreateOfferingForm({ onSuccess }) {
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/admin/courses').then(res => res.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/admin/offerings', data),
    onSuccess,
  });

  const onSubmit = (data) => mutation.mutate({ ...data, seats: Number(data.seats) });

  if (loadingCourses) return <Skeleton className="h-32 w-full" />;
  if (!courses?.length) return <EmptyState title="No Courses" description="No courses available to offer." />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
      <label className="block text-sm font-medium">Course</label>
      <select {...register('courseId')} className="border rounded px-3 py-2 w-full">
        <option value="">Select a course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {errors.courseId && <div className="text-red-600 text-sm">{errors.courseId.message}</div>}
      <Input label="Semester" {...register('semester')} error={errors.semester?.message} />
      <Input label="Seats" type="number" {...register('seats', { valueAsNumber: true })} error={errors.seats?.message} />
      {mutation.isError && <div className="text-red-600 text-sm">{mutation.error?.response?.data?.message || 'Creation failed'}</div>}
      <Button type="submit" disabled={mutation.isLoading} className="w-full">
        {mutation.isLoading ? <Skeleton className="h-6 w-20 mx-auto" /> : 'Create Offering'}
      </Button>
    </form>
  );
}
