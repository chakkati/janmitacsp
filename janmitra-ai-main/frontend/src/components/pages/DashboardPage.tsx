import { motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, HelpCircle } from 'lucide-react'
import { headingClass, useApp } from '../../context/AppContext'
import type { EligibilityResult } from '../../types'

interface DashboardPageProps {
  results: EligibilityResult[]
}

export function DashboardPage({ results }: DashboardPageProps) {
  const { tr, fontSize, setActiveTab } = useApp()
  const eligible = results.filter((r) => r.eligible)
  const ineligible = results.filter((r) => !r.eligible)

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-stone-900 via-[#111827] to-[#0a0f1a] p-8 sm:p-10"
      >
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_70%)]" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400/90">{tr('welcomeLabel')}</p>
          <h1 className={`mt-3 font-display font-semibold tracking-tight ${headingClass(fontSize, 1)}`}>
            {tr('welcomeTitle')}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400 sm:text-base">{tr('welcomeBody')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
            >
              {tr('askMitra')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-stone-200 transition hover:bg-white/5"
            >
              {tr('setupProfile')}
            </button>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={tr('eligibleTitle')} icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}>
          {eligible.length === 0 ? (
            <p className="text-sm text-stone-500">{tr('eligibleEmpty')}</p>
          ) : (
            <ul className="space-y-2">
              {eligible.map((scheme) => (
                <li
                  key={scheme.scheme_id}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-sm"
                >
                  <span className="font-medium">{scheme.scheme_name}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schemes')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400"
                  >
                    {tr('viewDetails')} <ArrowUpRight className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={tr('ineligibleTitle')} icon={<HelpCircle className="h-5 w-5 text-stone-400" />}>
          {ineligible.length === 0 ? (
            <p className="text-sm text-stone-500">{tr('ineligibleEmpty')}</p>
          ) : (
            <ul className="space-y-2">
              {ineligible.map((scheme) => (
                <li
                  key={scheme.scheme_id}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-stone-300">{scheme.scheme_name}</span>
                    <span className="text-xs text-red-400">
                      {scheme.rules_checked.find((r) => !r.passed)?.description ?? tr('ineligible')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">{icon}{title}</h2>
      {children}
    </section>
  )
}
