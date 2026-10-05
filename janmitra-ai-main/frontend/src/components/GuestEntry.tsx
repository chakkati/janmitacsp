import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

interface GuestEntryProps {
  onEnter: () => void
  apiOnline: boolean | null
}

export function GuestEntry({ onEnter, apiOnline }: GuestEntryProps) {
  const { tr, lang, setLang, isDark } = useApp()

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-[#0a0f1a] text-stone-100' : 'bg-[#f6f4ef] text-stone-900'}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">{tr('brand')}</p>
              <p className="text-xs text-stone-400">{tr('brandSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                apiOnline === true
                  ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                  : apiOnline === false
                    ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                    : 'bg-stone-500/10 text-stone-400 ring-1 ring-stone-500/20'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-stone-500'}`} />
              {apiOnline ? tr('apiOnline') : tr('apiOffline')}
            </span>

            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-stone-300 transition hover:bg-white/5"
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              <MapPin className="h-3.5 w-3.5" />
              {tr('welcomeLabel')}
            </div>

            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {tr('welcomeTitle')}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-400 sm:text-lg">
              {tr('welcomeBody')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onEnter}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
              >
                {tr('enterDemo')}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <p className="text-sm text-stone-500">{tr('enterDemoHint')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-16 grid gap-4 sm:grid-cols-3"
          >
            {[
              { n: '02', label: lang === 'en' ? 'Live schemes' : 'Live పథకాలు' },
              { n: '26', label: lang === 'en' ? 'AP districts' : 'AP జిల్లాలు' },
              { n: 'EN/TE', label: lang === 'en' ? 'Bilingual assistant' : 'ద్విభాషా సహాయకుడు' },
            ].map((item) => (
              <div
                key={item.n}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <p className="font-display text-2xl font-semibold text-amber-300">{item.n}</p>
                <p className="mt-1 text-sm text-stone-400">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
