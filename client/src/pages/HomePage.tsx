import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  BarChart3,
  Clock,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Brain,
  MessageSquare,
  Activity,
  FileText,
  Lock,
  Lightbulb,
} from 'lucide-react'
import { PublicLayout } from '@/components/layout'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  StatCard,
} from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  const modules = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Departments',
      description: 'Organize and manage academic departments efficiently',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Students',
      description: 'Track student information and enrollment history',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Teachers',
      description: 'Manage faculty assignments and profiles',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Courses',
      description: 'Define and manage course curriculum',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Semesters',
      description: 'Create and manage academic semesters',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Offerings',
      description: 'Schedule and offer courses each semester',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Enrollments',
      description: 'Process student enrollments and validations',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Results',
      description: 'Record and publish student academic results',
    },
  ]

  const roles = [
    {
      role: 'Admin',
      description: 'Full system access, manage all entities',
      permissions: ['Manage Departments', 'Manage Users', 'View Audit Logs'],
    },
    {
      role: 'Teacher',
      description: 'Manage courses and student results',
      permissions: ['View Offerings', 'Submit Marks', 'View Enrollments'],
    },
    {
      role: 'Student',
      description: 'View courses and enrollments',
      permissions: ['Enroll in Courses', 'View Results', 'Upload Documents'],
    },
  ]

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-text-dark-primary mb-6 leading-tight">
              Secure Academic Management Platform
            </h1>
            <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-8">
              Simplifying academic administration with transparency and precision. Manage departments,
              students, teachers, courses, enrollments, and results in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link to="/student/dashboard">
                  <Button size="lg">
                    Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg">
                      Get Started <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg p-8 shadow-lg hidden md:block">
            <div className="bg-white dark:bg-surface-darkCard rounded-lg p-6 shadow-lg">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="h-16 bg-blue-50 dark:bg-blue-900 rounded-lg"></div>
                  <div className="h-16 bg-teal-50 dark:bg-teal-900 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-12 text-center">
          Core Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, idx) => (
            <Card key={idx} hoverable>
              <CardBody>
                <div className="text-brand-primary dark:text-brand-accent-light mb-4">
                  {module.icon}
                </div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {module.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-brand-primary/10 dark:bg-brand-accent/10 px-6 py-2 rounded-full mb-4"
          >
            <Lightbulb className="w-5 h-5 text-brand-primary dark:text-brand-accent" />
            <span className="text-sm font-semibold text-brand-primary dark:text-brand-accent">
              ADVANCED FEATURES
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-text-dark-primary mb-6">
            Powerful Tools for<br />Educational Excellence
          </h2>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
            Built with educators and administrators in mind, featuring intelligent automation and comprehensive insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-surface-darkCard dark:to-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all duration-300 group">
              <div className="p-4 bg-blue-600 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                Intelligent Analytics
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                AI-powered insights into student performance, enrollment trends, and academic outcomes with predictive analytics
              </p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="h-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-surface-darkCard dark:to-purple-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all duration-300 group">
              <div className="p-4 bg-purple-600 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                Automated Grading
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Streamline assessment workflows with automated grading, result calculations, and instant GPA computations for all students
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="h-full bg-gradient-to-br from-teal-50 to-teal-100 dark:from-surface-darkCard dark:to-teal-900/20 rounded-2xl p-8 border border-teal-200 dark:border-teal-800 hover:shadow-xl transition-all duration-300 group">
              <div className="p-4 bg-teal-600 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                Unified Communication
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Keep students, teachers, and administrators connected with integrated messaging, announcements, and notifications
              </p>
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="h-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-surface-darkCard dark:to-amber-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800 hover:shadow-xl transition-all duration-300 group">
              <div className="p-4 bg-amber-600 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                Comprehensive Reports
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Generate detailed academic reports, transcripts, and compliance documents with customizable templates and exports
              </p>
            </div>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="h-full bg-gradient-to-br from-rose-50 to-rose-100 dark:from-surface-darkCard dark:to-rose-900/20 rounded-2xl p-8 border border-rose-200 dark:border-rose-800 hover:shadow-xl transition-all duration-300 group">
              <div className="p-4 bg-rose-600 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                Real-time Monitoring
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Monitor enrollment capacity, attendance patterns, and academic progress with live dashboards and instant alerts
              </p>
            </div>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="h-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-surface-darkCard dark:to-indigo-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all duration-300 group">
              <div className="p-4 bg-indigo-600 rounded-xl w-fit text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                Enterprise Security
              </h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">
                Military-grade encryption, role-based access control, audit logs, and compliance with educational data standards
              </p>
            </div>
          </motion.div>
        </div>

        {/* Highlight Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 bg-gradient-to-r from-brand-primary via-purple-600 to-brand-accent rounded-2xl p-12 text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="text-sm opacity-90">System Uptime</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <p className="text-sm opacity-90">Records Processed</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-sm opacity-90">Institutions</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-sm opacity-90">Expert Support</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-12 text-center">
          Role-Based Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <h3 className="text-xl font-bold text-brand-primary dark:text-brand-accent-light">
                  {item.role}
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
                  {item.description}
                </p>
                <ul className="space-y-2">
                  {item.permissions.map((perm, pidx) => (
                    <li key={pidx} className="flex items-center space-x-2 text-sm text-text-primary dark:text-text-dark-primary">
                      <CheckCircle className="w-4 h-4 text-semantic-success" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-12 text-center">
          Impact & Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users />}
            label="Total Students"
            value="1,250"
            color="primary"
          />
          <StatCard
            icon={<Users />}
            label="Total Teachers"
            value="145"
            color="accent"
          />
          <StatCard
            icon={<BookOpen />}
            label="Total Courses"
            value="320"
            color="success"
          />
          <StatCard
            icon={<Clock />}
            label="Active Offerings"
            value="89"
            color="warning"
          />
        </div>
      </section>

      {/* Final CTA */}
      {!isAuthenticated && (
        <section className="py-16 bg-brand-primary dark:bg-brand-accent rounded-lg text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of educational institutions using our platform
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Create Free Account
            </Button>
          </Link>
        </section>
      )}
    </PublicLayout>
  )
}

export default HomePage
