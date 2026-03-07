import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, UploadCloud } from 'lucide-react'
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout'
import { SectionHeading } from '@/components/marketing/shared'

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
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Admissions"
          title="Multi-step application experience"
          description="Track progress visually, upload documents through drag and drop, and stay aware of the admission deadline countdown."
        />

        <div className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div className="grid gap-4 sm:grid-cols-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isDone = stepNumber < activeStep
              const isCurrent = stepNumber === activeStep

              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(stepNumber)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  <p className="text-xs text-slate-500">Step {stepNumber}</p>
                  <p className="mt-1 text-sm font-semibold">{step}</p>
                  {isDone && <CheckCircle2 className="mt-2 h-4 w-4 text-emerald-500" />}
                </button>
              )
            })}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-800 via-violet-600 to-amber-400"
              animate={{ width: `${(activeStep / steps.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="font-heading text-2xl">Application Checklist</h3>
            <div className="mt-5 space-y-3">
              {checklist.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true }}
                >
                  <span className="text-sm">{item}</span>
                  {index < activeStep ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <span className="text-xs text-slate-500">Pending</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* File drag-and-drop is intentionally lightweight and progressive for broad browser support. */}
            <div
              className={`mt-8 rounded-3xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-300 dark:bg-blue-900/30'
                  : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
              }`}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                const files = Array.from(event.dataTransfer.files).map((file) => file.name)
                setUploaded((prev) => [...prev, ...files])
              }}
            >
              <UploadCloud className="mx-auto h-8 w-8 text-blue-700 dark:text-blue-300" />
              <p className="mt-3 text-sm font-semibold">Drop your documents here</p>
              <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG up to 10MB each</p>
            </div>

            {uploaded.length > 0 && (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm dark:bg-emerald-900/20">
                <p className="font-semibold">Uploaded Files</p>
                <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
                  {uploaded.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Deadline Countdown</p>
            <h3 className="mt-2 font-heading text-2xl">Application closes in</h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-800">
                <p className="text-3xl font-semibold text-blue-900 dark:text-blue-300">{countdown.days}</p>
                <p className="text-xs text-slate-500">Days</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-800">
                <p className="text-3xl font-semibold text-blue-900 dark:text-blue-300">{countdown.hours}</p>
                <p className="text-xs text-slate-500">Hours</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-800">
                <p className="text-3xl font-semibold text-blue-900 dark:text-blue-300">{countdown.minutes}</p>
                <p className="text-xs text-slate-500">Minutes</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-800">
                <p className="text-3xl font-semibold text-blue-900 dark:text-blue-300">{countdown.seconds}</p>
                <p className="text-xs text-slate-500">Seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UniversitySiteLayout>
  )
}

export default AdmissionsPage
