import React, { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout'
import { SectionHeading } from '@/components/marketing/shared'
import { facultyDirectory } from '@/data/universitySiteData'

const departments = ['All', ...Array.from(new Set(facultyDirectory.map((f) => f.department)))]

const FacultyPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    return facultyDirectory
      .filter((member) => member.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 5)
  }, [search])

  const filtered = useMemo(() => {
    return facultyDirectory.filter((member) => {
      const byDepartment = department === 'All' || member.department === department
      const bySearch = `${member.name} ${member.role} ${member.department}`
        .toLowerCase()
        .includes(search.toLowerCase())
      return byDepartment && bySearch
    })
  }, [department, search])

  return (
    <UniversitySiteLayout title="Faculty Directory">
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Faculty Directory"
          title="Searchable academic experts with flexible views"
          description="Switch between grid and list layouts, filter by department, and discover expertise tags quickly."
        />

        <div className="rounded-3xl border border-white/40 bg-white/80 p-5 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search faculty, role, or department"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-blue-200 focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
              {suggestions.length > 0 && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSearch(item.name)}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-800"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-900 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-900 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {departments.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDepartment(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  department === item
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-violet-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className={`mt-8 ${viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}`}>
          {filtered.map((member) => (
            <article key={member.id} className={viewMode === 'grid' ? 'flip-card h-[300px]' : 'rounded-3xl border border-white/40 bg-white/80 p-5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80'}>
              {viewMode === 'grid' ? (
                <div className="flip-card-inner h-full rounded-3xl border border-white/40 bg-white/80 dark:border-slate-700 dark:bg-slate-900/80">
                  <div className="flip-card-front flex h-full flex-col justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">{member.department}</p>
                      <h3 className="mt-2 font-heading text-xl font-semibold">{member.name}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{member.role}</p>
                    </div>
                    <p className="text-xs text-slate-500">Hover to view profile details</p>
                  </div>
                  <div className="flip-card-back flex h-full flex-col justify-between p-5">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{member.bio}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <span key={skill} className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-amber-600">{member.email}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">{member.department}</p>
                    <h3 className="mt-1 font-heading text-xl font-semibold">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.role}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{member.bio}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{member.email}</p>
                    <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                      {member.expertise.map((skill) => (
                        <span key={skill} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </UniversitySiteLayout>
  )
}

export default FacultyPage
