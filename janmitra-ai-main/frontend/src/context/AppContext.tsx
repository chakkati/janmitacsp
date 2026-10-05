import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { FontSize, Lang, TabId } from '../types'
import { t, type TranslationKey } from '../i18n'

interface AppContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  isDark: boolean
  setIsDark: (value: boolean) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  tr: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({
  children,
  lang,
  setLang,
  isDark,
  setIsDark,
  fontSize,
  setFontSize,
  activeTab,
  setActiveTab,
}: {
  children: ReactNode
  lang: Lang
  setLang: (lang: Lang) => void
  isDark: boolean
  setIsDark: (value: boolean) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
}) {
  const value = useMemo(
    () => ({
      lang,
      setLang,
      isDark,
      setIsDark,
      fontSize,
      setFontSize,
      activeTab,
      setActiveTab,
      tr: (key: TranslationKey, vars?: Record<string, string | number>) => t(lang, key, vars),
    }),
    [lang, setLang, isDark, setIsDark, fontSize, setFontSize, activeTab, setActiveTab],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function fontSizeClass(size: FontSize): string {
  if (size === 'large') return 'text-lg'
  if (size === 'extra-large') return 'text-xl'
  return 'text-base'
}

export function headingClass(size: FontSize, level: 1 | 2 | 3): string {
  if (level === 1) {
    return size === 'extra-large' ? 'text-4xl' : size === 'large' ? 'text-3xl' : 'text-2xl sm:text-3xl'
  }
  if (level === 2) {
    return size === 'extra-large' ? 'text-2xl' : size === 'large' ? 'text-xl' : 'text-lg sm:text-xl'
  }
  return size === 'extra-large' ? 'text-xl' : size === 'large' ? 'text-lg' : 'text-sm sm:text-base'
}
