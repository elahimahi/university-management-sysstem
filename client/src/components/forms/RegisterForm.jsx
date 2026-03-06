import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import api from '../lib/api';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterForm({ onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess,
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto">
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input label="Email" {...register('email')} error={errors.email?.message} />
      <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
      {mutation.isError && <div className="text-red-600 text-sm">{mutation.error?.response?.data?.message || 'Registration failed'}</div>}
      <Button type="submit" disabled={mutation.isLoading} className="w-full">
        {mutation.isLoading ? <Skeleton className="h-6 w-20 mx-auto" /> : 'Register'}
      </Button>
    </form>
  );
}
