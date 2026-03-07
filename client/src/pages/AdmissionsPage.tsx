
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, UploadCloud, Sparkles } from 'lucide-react';
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout';
import { SectionHeading } from '@/components/marketing/shared';

const steps = ['Account Setup', 'Program Selection', 'Document Upload', 'Application Review']

const checklist = [
  'Completed online application form',
  'Uploaded academic transcripts',
  'Uploaded passport-size photo',
  'Added recommendation details',
  'Paid application processing fee',
]

const deadline = new Date('2026-04-30T23:59:59').getTime()

const AdmissionsPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [uploaded, setUploaded] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(deadline - Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(Math.max(deadline - Date.now(), 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const countdown = useMemo(() => {
    const totalSeconds = Math.floor(timeLeft / 1000)
    const days = Math.floor(totalSeconds / (3600 * 24))
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds }
  }, [timeLeft])


  return (
    <UniversitySiteLayout title="Admissions">
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* Animated background shapes */}
        <motion.div
          className="pointer-events-none absolute left-[-10%] top-8 -z-10 h-44 w-44 rounded-full bg-blue-600/20 blur-3xl"
          animate={{ y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        <motion.div
          className="pointer-events-none absolute right-[2%] top-20 -z-10 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl"
          animate={{ y: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
        <motion.div
          className="pointer-events-none absolute bottom-12 left-[35%] -z-10 h-32 w-32 rounded-full bg-amber-400/30 blur-2xl"
          animate={{ x: [0, 40, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
        />

        {/* Hero section */}
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-800 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-blue-300"
          >
            <Sparkles className="h-4 w-4 animate-bounce" />
            Admissions Open
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="font-heading text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100"
          >
            Begin Your Journey at
            <span className="block bg-gradient-to-r from-blue-900 via-violet-700 to-amber-500 bg-clip-text text-transparent">
              Ahsanullah University
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300"
          >
            Experience a beautiful, animated, and seamless multi-step application. Track your progress, upload documents, and never miss a deadline!
          </motion.p>
        </div>

        <SectionHeading
          eyebrow="Admissions"
          title="Multi-step application experience"
          description="Track progress visually, upload documents through drag and drop, and stay aware of the admission deadline countdown."
        />

        {/* Stepper */}
        <div className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 shadow-xl">
          <div className="grid gap-4 sm:grid-cols-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isDone = stepNumber < activeStep;
              const isCurrent = stepNumber === activeStep;
              return (
                <motion.button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(stepNumber)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-300 shadow-sm hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-blue-400/40 ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30 scale-105 shadow-lg'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.p className="text-xs text-slate-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * index }}>
                    Step {stepNumber}
                  </motion.p>
                  <motion.p className="mt-1 text-sm font-semibold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 * index }}>
                    {step}
                  </motion.p>
                  <AnimatePresence>
                    {isDone && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="block mt-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-pulse" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-800 via-violet-600 to-amber-400 shadow-lg"
              animate={{ width: `${(activeStep / steps.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Checklist & Upload */}
          <div className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 shadow-xl">
            <h3 className="font-heading text-2xl mb-2">Application Checklist</h3>
            <div className="mt-5 space-y-3">
              {checklist.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800 shadow-sm"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <span className="text-sm font-medium">
                    {item}
                  </span>
                  <AnimatePresence>
                    {index < activeStep ? (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-pulse" />
                      </motion.span>
                    ) : (
                      <span className="text-xs text-slate-500">Pending</span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* File drag-and-drop with animation */}
            <motion.div
              className={`mt-8 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 shadow-lg ${
                dragging
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-300 dark:bg-blue-900/30 animate-pulse'
                  : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const files = Array.from(event.dataTransfer.files).map((file) => file.name);
                setUploaded((prev) => [...prev, ...files]);
              }}
              animate={dragging ? { scale: 1.03 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <UploadCloud className="mx-auto h-10 w-10 text-blue-700 dark:text-blue-300 animate-bounce" />
              <p className="mt-3 text-base font-semibold">Drop your documents here</p>
              <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG up to 10MB each</p>
            </motion.div>

            {uploaded.length > 0 && (
              <motion.div
                className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm dark:bg-emerald-900/20 shadow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-semibold">Uploaded Files</p>
                <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                  {uploaded.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Countdown */}
          <div className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 shadow-xl flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Deadline Countdown</p>
            <h3 className="mt-2 font-heading text-2xl">Application closes in</h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {['days', 'hours', 'minutes', 'seconds'].map((unit, idx) => (
                <motion.div
                  key={unit}
                  className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-800 shadow"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                >
                  <motion.p
                    className="text-3xl font-semibold text-blue-900 dark:text-blue-300"
                    key={unit + countdown[unit]}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {countdown[unit]}
                  </motion.p>
                  <p className="text-xs text-slate-500 capitalize">{unit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </UniversitySiteLayout>
  );
}

export default AdmissionsPage
