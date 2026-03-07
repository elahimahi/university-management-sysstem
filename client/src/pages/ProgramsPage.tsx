import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout'
import { SectionHeading } from '@/components/marketing/shared'
import { applicationTimeline, programs } from '@/data/universitySiteData'

const categories = ['all', 'engineering', 'business', 'arts', 'health'] as const

type Category = (typeof categories)[number]

const ProgramsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return programs
    return programs.filter((program) => program.category === activeCategory)
  }, [activeCategory])

  return (
    <UniversitySiteLayout title="Academic Programs">
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Academic Programs"
          title="Filterable programs with real admission readiness"
          description="Browse by category, compare details, and review requirement progress bars in one place."
        />

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                activeCategory === category
                  ? 'bg-blue-900 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-blue-100 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((program) => (
            <motion.article
              key={program.id}
              className="group rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur-xl transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
              whileHover={{ y: -7 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">{program.category}</p>
              <h3 className="mt-2 font-heading text-xl font-semibold">{program.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{program.overview}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{program.duration}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{program.mode}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">{program.tuition}</span>
              </div>

              <div className="mt-6 space-y-3">
                {program.requirements.map((req) => (
                  <div key={`${program.id}-${req.label}`}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{req.label}</span>
                      <span>{req.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-800 via-violet-600 to-amber-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${req.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Application Timeline"
          title="Interactive admissions deadlines"
          description="Use this timeline to keep track of each stage from opening day to offer letters."
        />

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-4 top-0 h-full w-px bg-slate-300 dark:bg-slate-700" />
          <div className="space-y-8">
            {applicationTimeline.map((item, index) => (
              <motion.article
                key={`${item.title}-${item.date}`}
                className="relative rounded-3xl border border-white/40 bg-white/80 p-5 pl-12 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <span className="absolute left-[9px] top-7 h-3 w-3 rounded-full bg-gradient-to-r from-blue-800 to-violet-600" />
                <p className="text-xs uppercase tracking-[0.2em] text-amber-600">{item.date}</p>
                <h3 className="mt-2 font-heading text-xl">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </UniversitySiteLayout>
  )
}

export default ProgramsPage
