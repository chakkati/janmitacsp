import { Bookmark } from 'lucide-react'
import { headingClass, useApp } from '../../context/AppContext'
import type { EligibilityResult } from '../../types'

interface SavedPageProps {
  results: EligibilityResult[]
  savedIds: string[]
  onToggleSave: (id: string) => void
}

export function SavedPage({ results, savedIds, onToggleSave }: SavedPageProps) {
  const { tr, fontSize, setActiveTab, isDark } = useApp()
  const saved = results.filter((r) => savedIds.includes(r.scheme_id))

  return (
    <div className="space-y-6">
      <h1 className={`flex items-center gap-2 font-display font-semibold ${headingClass(fontSize, 1)}`}>
        <Bookmark className="h-6 w-6 text-amber-400" />
        {tr('savedTitle')}
      </h1>

      {saved.length === 0 ? (
        <div
          className={`rounded-2xl border border-dashed p-10 text-center ${
            isDark ? 'border-white/10 bg-white/[0.02]' : 'border-stone-300 bg-white'
          }`}
        >
          <p className="mb-4 text-sm text-stone-500">{tr('savedEmpty')}</p>
          <button
            type="button"
            onClick={() => setActiveTab('schemes')}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950"
          >
            {tr('browseSchemes')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {saved.map((result) => (
            <article
              key={result.scheme_id}
              className={`rounded-2xl border p-5 ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-stone-200 bg-white'}`}
            >
              <h3 className="font-display text-lg font-semibold">{result.scheme_name}</h3>
              <p className="mt-2 text-sm text-stone-500">{result.benefits_summary}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs font-semibold ${result.eligible ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.eligible ? tr('eligible') : tr('ineligible')}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleSave(result.scheme_id)}
                  className="text-xs font-medium text-red-400 hover:underline"
                >
                  {tr('removeBookmark')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
