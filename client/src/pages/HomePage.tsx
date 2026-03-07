import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout'
import { AnimatedCounter, GlassPanel, SectionHeading, SkeletonCard } from '@/components/marketing/shared'
import { announcements, campusGallery, heroStats, programs } from '@/data/universitySiteData'

const featured = programs.slice(0, 4)

const HomePage: React.FC = () => {
  const { scrollY } = useScroll()
  const ySlow = useTransform(scrollY, [0, 600], [0, -70])
  const yFast = useTransform(scrollY, [0, 600], [0, -130])

  const [activeSlide, setActiveSlide] = useState(0)
  const [galleryLoading, setGalleryLoading] = useState(true)

  useEffect(() => {
    const slideInterval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % campusGallery.length)
    }, 3800)

    const skeletonTimer = window.setTimeout(() => {
      setGalleryLoading(false)
    }, 900)

    return () => {
      window.clearInterval(slideInterval)
      window.clearTimeout(skeletonTimer)
    }
  }, [])

  const tickerItems = useMemo(() => [...announcements, ...announcements], [])

  return (
    <UniversitySiteLayout title="Home">
      <section className="relative isolate overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(30,58,138,0.25),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.22),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_65%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(30,58,138,0.45),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.3),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_65%,#111827_100%)]" />

        {/* Parallax decorative shapes are transform-only for smooth GPU animations. */}
        <motion.div style={{ y: ySlow }} className="pointer-events-none absolute left-[-10%] top-8 -z-10 h-44 w-44 rounded-full bg-blue-600/20 blur-3xl" />
        <motion.div style={{ y: yFast }} className="pointer-events-none absolute right-[2%] top-20 -z-10 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />
        <motion.div style={{ y: ySlow }} className="pointer-events-none absolute bottom-12 left-[35%] -z-10 h-32 w-32 rounded-full bg-amber-400/30 blur-2xl" />

        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-800 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-blue-300"
            >
              <Sparkles className="h-4 w-4" />
              Next-Gen University Platform
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100"
            >
              Build Your Future In a
              <span className="block bg-gradient-to-r from-blue-900 via-violet-700 to-amber-500 bg-clip-text text-transparent">
                Connected Campus Ecosystem
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300"
            >
              A modern, animated university experience that combines admissions, academics, faculty, and campus life into one intelligent digital hub.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/admissions" className="inline-flex items-center gap-2 rounded-2xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/programs" className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-900 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200">
                Explore Programs
              </Link>
            </motion.div>
          </div>

          <GlassPanel className="relative overflow-hidden">
            <div className="absolute right-4 top-4 rounded-full bg-amber-300/20 p-3 text-amber-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-600 dark:text-violet-300">Live Snapshot</p>
            <h3 className="mt-2 font-heading text-2xl font-semibold">University At a Glance</h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/40 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/80">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-blue-900 dark:text-blue-300">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/70 py-4 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/60">
        <div className="relative overflow-hidden">
          <div className="news-ticker flex items-center gap-12 whitespace-nowrap px-4 text-sm text-slate-700 sm:px-6 lg:px-8 dark:text-slate-200">
            {tickerItems.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Programs"
          title="Career-focused degrees designed for tomorrow"
          description="Hover each program to reveal quick details, outcomes, and admission readiness snapshots."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((program) => (
            <motion.article
              key={program.id}
              className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-6 backdrop-blur-xl transition dark:border-slate-700/70 dark:bg-slate-900/70"
              whileHover={{ y: -8 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">{program.category}</p>
              <h3 className="mt-3 font-heading text-xl font-semibold">{program.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{program.overview}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{program.duration}</span>
                <span>{program.mode}</span>
              </div>
              <div className="mt-6 max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-24">
                <p className="text-xs font-semibold text-amber-600">{program.tuition}</p>
                <Link to="/programs" className="mt-2 inline-flex text-xs font-semibold text-blue-900 dark:text-blue-300">
                  See full details
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="campus" className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Campus Life"
          title="Stories from a vibrant student community"
          description="A smooth auto-advancing carousel that highlights labs, events, sports, and cultural experiences."
        />

        {galleryLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70">
            <motion.img
              key={campusGallery[activeSlide].id}
              src={campusGallery[activeSlide].image}
              alt={campusGallery[activeSlide].title}
              className="h-[420px] w-full rounded-2xl object-cover"
              initial={{ opacity: 0.35, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              loading="lazy"
            />
            <div className="absolute inset-x-8 bottom-8 rounded-2xl bg-slate-950/60 p-5 text-white backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{campusGallery[activeSlide].category}</p>
              <h3 className="mt-2 font-heading text-2xl">{campusGallery[activeSlide].title}</h3>
              <p className="mt-2 text-sm text-slate-200">{campusGallery[activeSlide].description}</p>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {campusGallery.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`h-2.5 rounded-full transition ${idx === activeSlide ? 'w-8 bg-blue-800 dark:bg-blue-300' : 'w-2.5 bg-slate-300 dark:bg-slate-600'}`}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="impact" className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-violet-700 to-amber-500 p-8 text-white sm:p-12">
          <SectionHeading
            eyebrow="Impact Metrics"
            title="Numbers that grow with every semester"
            description="Student, faculty, and community impact counters animate on view for a dynamic dashboard feel."
          />
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={`impact-${stat.label}`} className="rounded-2xl bg-white/10 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-100">{stat.label}</p>
                <p className="mt-3 text-4xl font-semibold">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </UniversitySiteLayout>
  )
}

export default HomePage
