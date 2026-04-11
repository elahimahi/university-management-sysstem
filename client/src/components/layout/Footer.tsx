import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Mail, Send, Twitter } from 'lucide-react'

const footerSections = [
  {
    title: 'Academics',
    links: [
      { label: 'Programs', to: '/programs' },
      { label: 'Faculty Directory', to: '/faculty' },
      { label: 'Events Calendar', to: '/events' },
    ],
  },
  {
    title: 'Admissions',
    links: [
      { label: 'Apply Now', to: '/admissions' },
      { label: 'Campus Life', to: '/campus-life' },
      { label: 'Scholarships', to: '/admissions' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', to: '/' },
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
    ],
  },
]

const socialLinks = [
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { label: 'Twitter', icon: Twitter, href: 'https://x.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
]

type FooterVariant = 'marketing' | 'classic'

interface FooterProps {
  variant?: FooterVariant
}

const Footer: React.FC<FooterProps> = ({ variant = 'marketing' }) => {
  const isMarketing = variant === 'marketing'

  return (
    <footer
      className={`mt-20 border-t ${
        isMarketing
          ? 'border-slate-200 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70'
          : 'border-border-light bg-surface-card dark:border-border-dark-dark dark:bg-surface-darkCard'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-r from-blue-900 via-violet-700 to-cyan-600 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-52 w-52 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-100">Stay Connected</p>
              <h4 className="font-heading mt-2 text-2xl font-semibold">Get campus updates in your inbox</h4>
              <p className="mt-1 text-sm text-blue-100">Admissions news, events, and scholarship announcements.</p>
            </div>
            <form className="flex w-full max-w-md items-center gap-2 rounded-2xl bg-white/15 p-2 backdrop-blur-sm" onSubmit={(event) => event.preventDefault()}>
              <Mail className="ml-2 h-4 w-4 text-white/80" />
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                aria-label="Email address"
              />
              <button type="submit" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-900 transition hover:bg-blue-50">
                Subscribe
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-violet-600 text-sm font-bold text-white shadow-md">
              AU
            </div>
            <h3 className="font-heading text-xl font-semibold text-slate-900 dark:text-slate-100">AUST University</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Modern academic management with secure operations, vibrant campus experiences, and student-first workflows.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{section.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="group inline-flex items-center text-slate-600 transition hover:text-blue-800 dark:text-slate-300 dark:hover:text-blue-300">
                      {link.label}
                      <span className="ml-2 h-px w-0 bg-blue-700 transition-all group-hover:w-3 dark:bg-blue-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} AUST University. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>admissions@aust.edu</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-400 md:inline-block" />
            <span>+880-1000-123456</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-400 md:inline-block" />
            <span>Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
