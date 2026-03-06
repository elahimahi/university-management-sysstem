import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PublicLayout } from '@/components/layout'
import { Button, Card, CardBody, Input, Alert } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, User } from 'lucide-react'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords don\'t match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null)
      await registerUser(data.name, data.email, data.password)
      navigate('/student/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-primary dark:bg-brand-accent rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                EU
              </div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
                Create Account
              </h1>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Join our platform to get started
              </p>
            </div>

            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError(null)}
                closable
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                startIcon={<User className="w-5 h-5" />}
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                startIcon={<Mail className="w-5 h-5" />}
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                startIcon={<Lock className="w-5 h-5" />}
                {...register('password')}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                startIcon={<Lock className="w-5 h-5" />}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-secondary dark:text-text-dark-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-primary dark:text-brand-accent-light hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </PublicLayout>
  )
}

export default RegisterPage
