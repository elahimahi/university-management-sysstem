import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
  X,
  MessageCircle,
  ArrowUp,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface UniversitySiteLayoutProps {
  children: React.ReactNode
  title: string
}

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Academic Programs', path: '/programs' },
  { label: 'Admissions', path: '/admissions' },
  { label: 'Campus Life', path: '/campus-life' },
  { label: 'Faculty Directory', path: '/faculty' },
  { label: 'Events Calendar', path: '/events' },
]

const programGroups = [
  {
    title: 'Engineering & Tech',
    items: ['Computer Science', 'Electrical Engineering', 'AI & Data Science'],
  },
  {
    title: 'Business & Leadership',
    items: ['Strategic Management', 'Economics', 'Public Policy'],
  },
  {
    title: 'Health & Life Sciences',
    items: ['Nursing Sciences', 'Public Health', 'Biotechnology'],
  },
]

export const UniversitySiteLayout: React.FC<UniversitySiteLayoutProps> = ({ children, title }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [isScrolled, setIsScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    document.title = `${title} | AUST University`
  }, [title])

  useEffect(() => {
    const timer = window.setTimeout(() => setIsInitialLoading(false), 850)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = height > 0 ? (y / height) * 100 : 0

      setIsScrolled(y > 14)
      setShowBackTop(y > 420)
      setProgress(nextProgress)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const k = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && k === 'k') {
        event.preventDefault()
        setSearchOpen((prev) => !prev)
      }
      if (k === 'escape') {
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setMegaOpen(false)
    setSearchTerm('')
    setSearchOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const filteredLinks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return quickLinks
    return quickLinks.filter((link) => link.label.toLowerCase().includes(term))
  }, [searchTerm])

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-b from-slate-50 via-blue-50/50 to-slate-100 text-slate-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
      <div className="fixed inset-x-0 top-0 z-[70] h-1 bg-slate-200/70 dark:bg-slate-700/60">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-800 via-violet-600 to-amber-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950 text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
              >
                <span className="text-2xl font-bold text-amber-300">AU</span>
              </motion.div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Loading Campus Experience</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`sticky top-1 z-50 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-white/20 bg-white/70 py-2 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="AUST home">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-violet-600 text-sm font-bold text-white shadow-md">
              AU
            </div>
            <div>
              <p className="font-heading text-sm uppercase tracking-[0.2em] text-blue-900 dark:text-blue-300">AUST</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">University Management</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            <Link className="transition hover:text-blue-800 dark:hover:text-blue-300" to="/">Home</Link>
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 transition hover:text-blue-800 dark:hover:text-blue-300"
                aria-expanded={megaOpen}
              >
                Programs <ChevronDown className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    className="absolute left-1/2 top-10 w-[680px] -translate-x-1/2 rounded-3xl border border-white/40 bg-white/85 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/85"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="grid grid-cols-3 gap-5">
                      {programGroups.map((group) => (
                        <div key={group.title}>
                          <p className="mb-3 font-semibold text-blue-900 dark:text-blue-300">{group.title}</p>
                          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                            {group.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Link
                        to="/programs"
                        className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                      >
                        Explore Programs
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link className="transition hover:text-blue-800 dark:hover:text-blue-300" to="/admissions">Admissions</Link>
            <Link className="transition hover:text-blue-800 dark:hover:text-blue-300" to="/campus-life">Campus Life</Link>
            <Link className="transition hover:text-blue-800 dark:hover:text-blue-300" to="/faculty">Faculty</Link>
            <Link className="transition hover:text-blue-800 dark:hover:text-blue-300" to="/events">Events</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-500 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 md:inline-flex"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
              Search
              <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px] dark:border-slate-600">Ctrl+K</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 bg-white/70 p-2 transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900/70"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-xl border border-slate-200 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-900/70 lg:hidden"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mx-4 mt-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 lg:hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="flex flex-col gap-2">
                {quickLinks.map((item) => (
                  <Link key={item.path} to={item.path} className="rounded-xl px-3 py-2 text-sm transition hover:bg-blue-50 dark:hover:bg-slate-800">
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white/60 py-12 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className="font-heading text-xl text-blue-900 dark:text-blue-300">AUST University</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">A modern academic ecosystem for learning, research, and impact.</p>
          </div>
          <div>
            <p className="font-semibold">Academics</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/faculty">Faculty</Link></li>
              <li><Link to="/events">Academic Calendar</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Admissions</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><Link to="/admissions">Apply Now</Link></li>
              <li><Link to="/campus-life">Visit Campus</Link></li>
              <li><a href="#" aria-label="Scholarships">Scholarships</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>admissions@aust.edu</li>
              <li>+880-1000-123456</li>
              <li>Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-start justify-center bg-slate-950/50 p-4 pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold">Quick Search</p>
                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search pages, programs, campus..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-blue-200 transition focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="mt-4 space-y-2">
                {filteredLinks.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      navigate(item.path)
                      setSearchOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    {item.label}
                    <span className="text-xs text-slate-500">{item.path}</span>
                  </button>
                ))}
                {filteredLinks.length === 0 && (
                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800">No results found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-5 z-[60] flex flex-col items-end gap-3">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              className="w-80 rounded-3xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <p className="font-semibold">Campus Assistant</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Hi! Ask about admissions, available programs, or event schedules.
              </p>
              <button
                type="button"
                className="mt-3 rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Start Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setChatOpen((prev) => !prev)}
          className="rounded-full bg-gradient-to-r from-blue-900 to-violet-600 p-3 text-white shadow-lg transition hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-5 w-5" />
        </button>

        <AnimatePresence>
          {showBackTop && (
            <motion.button
              type="button"
              className="rounded-full bg-slate-900 p-3 text-white shadow-lg dark:bg-slate-200 dark:text-slate-900"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
