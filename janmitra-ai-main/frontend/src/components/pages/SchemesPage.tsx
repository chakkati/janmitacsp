import { Bookmark, CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react'
import { headingClass, useApp } from '../../context/AppContext'
import type { EligibilityResult } from '../../types'

interface SchemesPageProps {
  results: EligibilityResult[]
  loading: boolean
  savedIds: string[]
  onToggleSave: (id: string) => void
}

export function SchemesPage({ results, loading, savedIds, onToggleSave }: SchemesPageProps) {
  const { tr, fontSize, isDark } = useApp()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-amber-400" />
        <p className="text-sm">{tr('schemesLoading')}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {results.map((result) => (
        <article
          key={result.scheme_id}
          className={`rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
            isDark ? 'border-white/8 bg-white/[0.02] hover:border-amber-500/20' : 'border-stone-200 bg-white'
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
              {tr('activeScheme')}
            </span>
            {result.eligible ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> {tr('eligible')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                <XCircle className="h-3.5 w-3.5" /> {tr('ineligible')}
              </span>
            )}
          </div>

          <h3 className={`font-display font-semibold ${headingClass(fontSize, 2)}`}>{result.scheme_name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">{result.benefits_summary}</p>

          <div className={`mt-4 rounded-xl border p-3 text-xs ${isDark ? 'border-white/8 bg-black/20' : 'border-stone-200 bg-stone-50'}`}>
            <p className="mb-2 font-semibold uppercase tracking-wide text-stone-500">{tr('rulesTitle')}</p>
            {result.rules_checked.map((rule) => (
              <div key={rule.field_name + rule.description} className="flex justify-between gap-3 py-1">
                <span className={rule.passed ? 'text-stone-400' : 'text-red-400'}>{rule.description}</span>
                <span className={rule.passed ? 'text-emerald-400' : 'text-red-400'}>
                  {rule.passed ? tr('passed') : tr('failed')}
                </span>
              </div>
            ))}
          </div>

          {result.required_documents.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{tr('documentsTitle')}</p>
              <div className="flex flex-wrap gap-1.5">
                {result.required_documents.map((doc) => (
                  <span
                    key={doc.id}
                    className={`rounded-lg px-2 py-1 text-[11px] ${isDark ? 'bg-white/5 text-stone-400' : 'bg-stone-100 text-stone-600'}`}
                  >
                    {doc.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            {result.official_website && (
              <a
                href={result.official_website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-amber-500 py-2.5 text-xs font-semibold text-stone-950 transition hover:bg-amber-400"
              >
                {tr('officialPortal')} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onToggleSave(result.scheme_id)}
              className={`rounded-xl border p-2.5 transition ${
                savedIds.includes(result.scheme_id)
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : isDark
                    ? 'border-white/10 text-stone-400 hover:text-stone-100'
                    : 'border-stone-200 text-stone-500'
              }`}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
