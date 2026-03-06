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
  grades: z.array(z.object({
    enrollmentId: z.number(),
    grade: z.string().min(1, 'Grade required'),
  })),
});

export default function SubmitGradesForm({ offeringId, onSuccess }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['offeringStudents', offeringId],
    queryFn: () => api.get(`/teacher/offerings/${offeringId}/students`).then(res => res.data),
    enabled: !!offeringId,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { grades: data?.map(s => ({ enrollmentId: s.enrollmentId, grade: s.grade || '' })) },
  });

  const mutation = useMutation({
    mutationFn: (form) => api.post(`/teacher/offerings/${offeringId}/grades`, form),
    onSuccess,
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (isError) return <EmptyState title="Error" description="Could not load students." />;
  if (!data?.length) return <EmptyState title="No Students" description="No students enrolled." />;

  const onSubmit = (form) => mutation.mutate(form);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl mx-auto">
      {data.map((student, idx) => (
        <div key={student.enrollmentId} className="flex items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold">{student.name}</div>
            <div className="text-xs text-gray-400">Enrollment #{student.enrollmentId}</div>
          </div>
          <Input
            label="Grade"
            {...register(`grades.${idx}.grade`)}
            error={errors.grades?.[idx]?.grade?.message}
          />
        </div>
      ))}
      {mutation.isError && <div className="text-red-600 text-sm">{mutation.error?.response?.data?.message || 'Submission failed'}</div>}
      <Button type="submit" disabled={mutation.isLoading} className="w-full">
        {mutation.isLoading ? <Skeleton className="h-6 w-20 mx-auto" /> : 'Submit Grades'}
      </Button>
    </form>
  );
}
