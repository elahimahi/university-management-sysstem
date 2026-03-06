import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PublicLayout } from '@/components/layout'
import { Button, Card, CardBody, Input, Alert } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null)
      await login(data.email, data.password)
      
      // Get user from localStorage to determine redirect
      setTimeout(() => {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const userData = JSON.parse(userStr)
          if (userData.role === 'admin') {
            navigate('/admin/dashboard')
          } else if (userData.role === 'teacher') {
            navigate('/teacher/dashboard')
          } else {
            navigate('/student/dashboard')
          }
        } else {
          navigate('/student/dashboard')
        }
      }, 100)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
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
                Welcome Back
              </h1>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Login to your account to continue
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

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-secondary dark:text-text-dark-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-primary dark:text-brand-accent-light hover:underline font-semibold">
                Sign up
              </Link>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Demo Credentials:
              </p>
              <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                <p>Admin: admin@test.com / password123</p>
                <p>Teacher: teacher@test.com / password123</p>
                <p>Student: student@test.com / password123</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </PublicLayout>
  )
}

export default LoginPage
