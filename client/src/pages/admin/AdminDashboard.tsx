import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  Clock,
  Building,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Activity,
  CalendarClock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import {
  Skeleton,
  Alert,
} from '@/components/ui'
import { adminAPI } from '@/api'

const quickActionItems = [
  {
    title: 'Departments',
    description: 'Create, update, and organize academic departments.',
    href: '/admin/departments',
    icon: Building,
    accent: 'from-blue-700 to-blue-500',
  },
  {
    title: 'Courses',
    description: 'Manage course catalog, credits, and ownership.',
    href: '/admin/courses',
    icon: BookOpen,
    accent: 'from-violet-700 to-violet-500',
  },
  {
    title: 'Semesters',
    description: 'Configure terms, timelines, and enrollment windows.',
    href: '/admin/semesters',
    icon: CalendarClock,
    accent: 'from-teal-700 to-teal-500',
  },
  {
    title: 'Audit Logs',
    description: 'Track all system changes and user activity trails.',
    href: '/admin/audit-logs',
    icon: BarChart3,
    accent: 'from-amber-600 to-orange-500',
  },
]

const recentActivity = [
  { label: 'CSE department profile updated', time: '12 minutes ago' },
  { label: 'New semester schedule drafted', time: '45 minutes ago' },
  { label: 'Course catalog review completed', time: '2 hours ago' },
  { label: 'System permission check executed', time: 'Today' },
]

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminAPI.getStats()
      return response.data as { total_students: number; total_teachers: number; total_courses: number; active_offerings: number }
    },
  })

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="error" message="Failed to load dashboard statistics" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-r from-blue-900 via-blue-800 to-violet-700 p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-amber-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100">Admin Control Center</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">University Operations Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
                A modern control panel for academic governance, data visibility, and institutional workflow decisions.
              </p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              View Full Audit Trail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : (
            <>
              {[
                {
                  label: 'Total Students',
                  value: stats?.total_students || 0,
                  icon: Users,
                  hint: '+4.8% from previous term',
                },
                {
                  label: 'Total Teachers',
                  value: stats?.total_teachers || 0,
                  icon: Users,
                  hint: 'Faculty capacity steady',
                },
                {
                  label: 'Total Courses',
                  value: stats?.total_courses || 0,
                  icon: BookOpen,
                  hint: '12 new electives this year',
                },
                {
                  label: 'Active Offerings',
                  value: stats?.active_offerings || 0,
                  icon: Clock,
                  hint: 'Peak scheduling week',
                },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.article
                    key={item.label}
                    className="rounded-3xl border border-white/40 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                      {item.value.toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">{item.hint}</p>
                  </motion.article>
                )
              })}
            </>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">One-click access to core control surfaces</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {quickActionItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className="group block rounded-3xl border border-white/40 bg-white/75 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/70"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                      </div>
                      <div className={`rounded-2xl bg-gradient-to-br p-3 text-white ${item.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition group-hover:gap-3 dark:text-blue-300">
                      Open {item.title}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-white/40 bg-white/75 p-6 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
                <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                Recent Activity
              </h3>
              <Link to="/admin/audit-logs" className="text-sm font-medium text-blue-800 hover:underline dark:text-blue-300">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-slate-800/70">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/40 bg-white/75 p-6 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              System Health
            </h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>API uptime</span>
                  <span>99.9%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-2 w-[99.9%] rounded-full bg-emerald-500" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Data sync</span>
                  <span>97.5%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-2 w-[97.5%] rounded-full bg-blue-500" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Queue processing</span>
                  <span>92.2%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-2 w-[92.2%] rounded-full bg-violet-500" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800/70">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Activity className="h-4 w-4 text-amber-600" />
                Next maintenance window
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sunday, 2:00 AM - 3:00 AM (local server time)</p>
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
