import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { apiFetch, clearAuthToken, getAuthToken, setAuthToken } from './api/client'
import { GuestEntry } from './components/GuestEntry'
import { Shell } from './components/layout/Shell'
import { ChatPage } from './components/pages/ChatPage'
import { DashboardPage } from './components/pages/DashboardPage'
import { ProfileFormState, ProfilePage } from './components/pages/ProfilePage'
import { SavedPage } from './components/pages/SavedPage'
import { SchemesPage } from './components/pages/SchemesPage'
import { DEMO_TOKEN, SAVED_SCHEMES_KEY } from './constants'
import { AppProvider, useApp } from './context/AppContext'
import type {
  ChatMessage,
  EligibilityResult,
  FontSize,
  HealthStatus,
  Lang,
  Profile,
  ProfileUpdatePayload,
  TabId,
} from './types'

function AppInner() {
  const { activeTab, lang, tr, setActiveTab } = useApp()
  const [token, setTokenState] = useState<string | null>(() => getAuthToken())
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [results, setResults] = useState<EligibilityResult[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem(SAVED_SCHEMES_KEY) || '[]'),
  )
  const [toast, setToast] = useState<string | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const [form, setForm] = useState<ProfileFormState>({
    fullName: '',
    phoneNumber: '',
    age: 18,
    gender: 'Male',
    casteCategory: 'General',
    occupation: 'Other',
    annualIncome: 0,
    isDisabled: false,
    isFarmer: false,
    district: 'Visakhapatnam',
  })

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(() => {
    localStorage.setItem(SAVED_SCHEMES_KEY, JSON.stringify(savedIds))
  }, [savedIds])

  useEffect(() => {
    apiFetch<HealthStatus>('/api/v1/health')
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  useEffect(() => {
    if (!token) return
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: tr('chatWelcome'),
        created_at: new Date().toISOString(),
      },
    ])
  }, [token, lang, tr])

  const loadProfile = useCallback(async (authToken: string) => {
    setResultsLoading(true)
    try {
      const data = await apiFetch<Profile>('/api/v1/profiles/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setProfile(data)
      setForm({
        fullName: data.full_name || '',
        phoneNumber: data.phone_number || '',
        age: data.age || 18,
        gender: data.gender || 'Male',
        casteCategory: data.caste_category || 'General',
        occupation: data.occupation || 'Other',
        annualIncome: Number(data.annual_income) || 0,
        isDisabled: data.is_disabled || false,
        isFarmer: data.is_farmer || false,
        district: data.district || 'Visakhapatnam',
      })

      const matches = await apiFetch<EligibilityResult[]>('/api/v1/schemes/match/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setResults(Array.isArray(matches) ? matches : [])
      setApiOnline(true)
    } catch {
      setApiOnline(false)
      if (!getAuthToken()) {
        setTokenState(null)
      }
    } finally {
      setResultsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) loadProfile(token)
  }, [token, loadProfile])

  const enterDemo = () => {
    setAuthToken(DEMO_TOKEN)
    setTokenState(DEMO_TOKEN)
  }

  const logout = () => {
    clearAuthToken()
    setTokenState(null)
    setProfile(null)
    setResults([])
    setActiveTab('dashboard')
  }

  const updateForm = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setProfileSaving(true)
    const payload: ProfileUpdatePayload = {
      full_name: form.fullName,
      phone_number: form.phoneNumber,
      age: form.age,
      gender: form.gender,
      caste_category: form.casteCategory,
      occupation: form.occupation,
      annual_income: form.annualIncome,
      is_disabled: form.isDisabled,
      is_farmer: form.isFarmer,
      district: form.district,
      state: 'Andhra Pradesh',
    }

    try {
      const updated = await apiFetch<Profile>('/api/v1/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      setProfile(updated)
      const matches = await apiFetch<EligibilityResult[]>('/api/v1/schemes/match/me')
      setResults(matches)
      showToast(tr('profileSaved'))
    } catch {
      showToast(tr('profileError'))
    } finally {
      setProfileSaving(false)
    }
  }

  const sendChat = async (e: FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !token) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: chatInput.trim(),
      created_at: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const reply = await apiFetch<ChatMessage>('/api/v1/chat', {
        method: 'POST',
        body: JSON.stringify({ content: userMsg.content }),
      })
      setChatMessages((prev) => [...prev, reply])
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: lang === 'en'
            ? 'Could not reach the assistant. Ensure the backend is running on port 8000.'
            : 'సహాయకుడిని సంప్రదించలేకపోయాం. backend port 8000 లో run అవుతోందో చూడండి.',
          created_at: new Date().toISOString(),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const toggleSave = (schemeId: string) => {
    setSavedIds((prev) => (prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]))
  }

  if (!token) {
    return <GuestEntry onEnter={enterDemo} apiOnline={apiOnline} />
  }

  const displayName = profile?.full_name?.trim() || tr('guestName')

  return (
    <>
      <Shell
        district={form.district}
        displayName={displayName}
        apiOnline={apiOnline}
        onLogout={logout}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardPage results={results} />}
            {activeTab === 'chat' && (
              <ChatPage
                messages={chatMessages}
                input={chatInput}
                loading={chatLoading}
                onInputChange={setChatInput}
                onSend={sendChat}
              />
            )}
            {activeTab === 'schemes' && (
              <SchemesPage results={results} loading={resultsLoading} savedIds={savedIds} onToggleSave={toggleSave} />
            )}
            {activeTab === 'saved' && <SavedPage results={results} savedIds={savedIds} onToggleSave={toggleSave} />}
            {activeTab === 'profile' && (
              <ProfilePage form={form} saving={profileSaving} onChange={updateForm} onSubmit={saveProfile} />
            )}
          </motion.div>
        </AnimatePresence>
      </Shell>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-amber-500/30 bg-stone-900 px-5 py-2.5 text-sm text-stone-100 shadow-xl">
          {toast}
        </div>
      )}
    </>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [isDark, setIsDark] = useState(true)
  const [fontSize, setFontSize] = useState<FontSize>('normal')
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }, [isDark])

  return (
    <AppProvider
      lang={lang}
      setLang={setLang}
      isDark={isDark}
      setIsDark={setIsDark}
      fontSize={fontSize}
      setFontSize={setFontSize}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <AppInner />
    </AppProvider>
  )
}
