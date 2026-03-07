import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarPlus } from 'lucide-react'
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout'
import { SectionHeading } from '@/components/marketing/shared'
import { events } from '@/data/universitySiteData'

type CalendarView = 'month' | 'week' | 'day'

const categoryClasses: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  career: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  sports: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  community: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()

const EventsPage: React.FC = () => {
  const today = new Date()
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10))

  const calendarDays = useMemo(() => {
    const year = today.getFullYear()
    const month = today.getMonth()
    const total = getDaysInMonth(year, month)
    return Array.from({ length: total }, (_, idx) => {
      const date = new Date(year, month, idx + 1)
      return date.toISOString().slice(0, 10)
    })
  }, [today])

  const selectedEvents = events.filter((event) => event.date === selectedDate)

  const visibleDays = useMemo(() => {
    if (view === 'month') return calendarDays
    if (view === 'week') {
      const activeIndex = calendarDays.findIndex((day) => day === selectedDate)
      const start = Math.max(activeIndex - 3, 0)
      return calendarDays.slice(start, start + 7)
    }
    return [selectedDate]
  }, [calendarDays, selectedDate, view])

  return (
    <UniversitySiteLayout title="Events Calendar">
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Events Calendar"
          title="Interactive month, week, and day timeline"
          description="Browse upcoming events, open event details, and add key activities to your calendar."
        />

        <div className="rounded-3xl border border-white/40 bg-white/80 p-5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-heading text-2xl">March 2026</h3>
            <div className="flex gap-2">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={`rounded-xl px-4 py-2 text-sm capitalize transition ${
                    view === mode
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-5 grid gap-2 ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
            {visibleDays.map((day) => {
              const dayEvents = events.filter((event) => event.date === day)
              const dayNumber = Number(day.split('-')[2])

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-28 rounded-2xl border p-3 text-left transition ${
                    selectedDate === day
                      ? 'border-blue-400 bg-blue-50 dark:border-blue-300 dark:bg-blue-900/30'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  <p className="text-sm font-semibold">{dayNumber}</p>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map((event) => (
                      <span
                        key={event.id}
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${categoryClasses[event.category]}`}
                      >
                        {event.title}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {selectedEvents.length === 0 && (
            <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">No events on selected date.</p>
          )}

          {selectedEvents.map((event, index) => (
            <motion.article
              key={event.id}
              className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${categoryClasses[event.category]}`}>
                    {event.category}
                  </span>
                  <h3 className="mt-2 font-heading text-2xl">{event.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{event.location}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Add to calendar
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </UniversitySiteLayout>
  )
}

export default EventsPage
