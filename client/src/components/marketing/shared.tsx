import React, { useEffect, useMemo, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export const SectionHeading: React.FC<{
  eyebrow: string
  title: string
  description: string
}> = ({ eyebrow, title, description }) => {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-300">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl dark:text-slate-100">{title}</h2>
      <p className="mt-4 text-sm text-slate-600 sm:text-base dark:text-slate-300">{description}</p>
    </div>
  )
}

export const GlassPanel: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-3xl border border-white/40 bg-white/70 p-6 shadow-lg backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 ${className}`}>
      {children}
    </div>
  )
}

export const AnimatedCounter: React.FC<{
  value: number
  suffix?: string
  className?: string
}> = ({ value, suffix = '', className = '' }) => {
  const [display, setDisplay] = useState(0)
  const ref = React.useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return

    const durationMs = 1200
    const start = performance.now()
    let raf = 0

    const step = (time: number) => {
      const progress = Math.min((time - start) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(value * eased))
      if (progress < 1) {
        raf = window.requestAnimationFrame(step)
      }
    }

    raf = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(raf)
  }, [inView, value])

  const formatted = useMemo(() => display.toLocaleString(), [display])

  return (
    <motion.span ref={ref} className={className}>
      {formatted}
      {suffix}
    </motion.span>
  )
}

export const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="h-4 w-24 rounded bg-slate-300 dark:bg-slate-700" />
      <div className="mt-3 h-6 w-2/3 rounded bg-slate-300 dark:bg-slate-700" />
      <div className="mt-4 h-3 w-full rounded bg-slate-300 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-5/6 rounded bg-slate-300 dark:bg-slate-700" />
    </div>
  )
}
