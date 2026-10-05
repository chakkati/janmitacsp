import {
  Bookmark,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Sun,
  Type,
  User,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { fontSizeClass, headingClass, useApp } from '../../context/AppContext'
import type { TabId } from '../../types'

interface ShellProps {
  children: React.ReactNode
  district: string
  displayName: string
  apiOnline: boolean | null
  onLogout: () => void
}

const tabs: { id: TabId; icon: typeof LayoutDashboard; labelKey: 'navDashboard' | 'navChat' | 'navSchemes' | 'navSaved' | 'navProfile' }[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'navDashboard' },
  { id: 'chat', icon: MessageSquare, labelKey: 'navChat' },
  { id: 'schemes', icon: Search, labelKey: 'navSchemes' },
  { id: 'saved', icon: Bookmark, labelKey: 'navSaved' },
  { id: 'profile', icon: User, labelKey: 'navProfile' },
]

export function Shell({ children, district, displayName, apiOnline, onLogout }: ShellProps) {
  const { tr, lang, setLang, isDark, setIsDark, fontSize, setFontSize, activeTab, setActiveTab } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  const cycleFont = () => {
    setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'extra-large' : 'normal')
  }

  return (
    <div className={`min-h-screen ${fontSizeClass(fontSize)} ${isDark ? 'bg-[#0a0f1a] text-stone-100' : 'bg-[#f6f4ef] text-stone-900'}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? 'border-white/8 bg-[#0a0f1a]/85' : 'border-stone-200/80 bg-[#f6f4ef]/90'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 font-display text-sm font-bold text-stone-950">
              JM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-display text-lg font-semibold ${headingClass(fontSize, 3)}`}>{tr('brand')}</span>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                  {tr('demoBadge')}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">{district}</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <StatusPill online={apiOnline} label={apiOnline ? tr('apiOnline') : tr('apiOffline')} />
            <IconButton onClick={cycleFont} title="Font size">
              <Type className="h-4 w-4" />
            </IconButton>
            <IconButton onClick={() => setLang(lang === 'en' ? 'te' : 'en')} title="Language">
              <Languages className="h-4 w-4" />
            </IconButton>
            <IconButton onClick={() => setIsDark(!isDark)} title="Theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconButton>
            <div className="ml-2 flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 font-semibold text-stone-950">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-stone-300">{displayName}</span>
            </div>
            <IconButton onClick={onLogout} title={tr('logout')}>
              <LogOut className="h-4 w-4 text-red-400" />
            </IconButton>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <IconButton onClick={cycleFont}>
              <Type className="h-4 w-4" />
            </IconButton>
            <IconButton onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </IconButton>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-b lg:hidden ${isDark ? 'border-white/8 bg-[#0a0f1a]' : 'border-stone-200 bg-white'}`}
          >
            <div className="space-y-1 px-4 py-3">
              {tabs.map((tab) => (
                <NavButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileOpen(false)
                  }}
                  icon={tab.icon}
                  label={tr(tab.labelKey)}
                  isDark={isDark}
                />
              ))}
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-red-400"
              >
                {tr('logout')}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <NavButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tr(tab.labelKey)}
                isDark={isDark}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className={`border-t py-8 ${isDark ? 'border-white/8 text-stone-500' : 'border-stone-200 text-stone-600'}`}>
        <div className="mx-auto max-w-7xl px-4 text-center text-xs sm:px-6">
          <p>{tr('footer')}</p>
          <p className="mt-1 opacity-70">{tr('footerNote')}</p>
        </div>
      </footer>
    </div>
  )
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
  isDark,
}: {
  active: boolean
  onClick: () => void
  icon: typeof LayoutDashboard
  label: string
  isDark: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-amber-500 text-stone-950'
          : isDark
            ? 'text-stone-400 hover:bg-white/5 hover:text-stone-100'
            : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  )
}

function IconButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg border border-white/10 p-2 text-stone-400 transition hover:bg-white/5 hover:text-stone-100"
    >
      {children}
    </button>
  )
}

function StatusPill({ online, label }: { online: boolean | null; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-500/10 text-stone-400'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
      {label}
    </span>
  )
}
