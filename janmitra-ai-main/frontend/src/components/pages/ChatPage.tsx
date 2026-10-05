import { Loader2, Send, Sparkles } from 'lucide-react'
import { FormEvent, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import type { ChatMessage } from '../../types'

interface ChatPageProps {
  messages: ChatMessage[]
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: (e: FormEvent) => void
}

export function ChatPage({ messages, input, loading, onInputChange, onSend }: ChatPageProps) {
  const { tr, isDark } = useApp()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div
      className={`flex h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-2xl border ${
        isDark ? 'border-white/8 bg-white/[0.02]' : 'border-stone-200 bg-white'
      }`}
    >
      <div className={`flex items-center gap-3 border-b px-4 py-3 ${isDark ? 'border-white/8' : 'border-stone-200'}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-stone-950">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{tr('chatTitle')}</p>
          <p className="text-[11px] text-emerald-400">{tr('chatLive')}</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-stone-950'
                  : isDark
                    ? 'border border-white/8 bg-[#111827] text-stone-200'
                    : 'border border-stone-200 bg-stone-50 text-stone-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className={`mt-3 border-t pt-2 text-[11px] ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
                  <p className="mb-1 font-semibold text-stone-500">{tr('sources')}</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-500 hover:underline"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            {tr('chatThinking')}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSend}
        className={`flex gap-2 border-t p-4 ${isDark ? 'border-white/8' : 'border-stone-200'}`}
      >
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={tr('chatPlaceholder')}
          className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none ring-amber-500/30 focus:ring-2 ${
            isDark
              ? 'border-white/10 bg-[#0a0f1a] text-stone-100 placeholder:text-stone-500'
              : 'border-stone-200 bg-white text-stone-900'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-amber-500 px-4 py-3 text-stone-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
