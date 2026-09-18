import Anthropic from '@anthropic-ai/sdk'
import { ChevronRight, KeyRound, Send, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { runCoachTurn } from '../../lib/aiCoach'
import { useApiKey } from '../../hooks/useApiKey'
import type { Equipment, Routine } from '../../types'
import { Button } from '../shared/Button'

interface CoachChatProps {
  routine: Routine
  equipment: Equipment
  onClose: () => void
  onRoutineChange: (routine: Routine) => void
}

interface DisplayMessage {
  id: string
  role: 'user' | 'assistant' | 'error'
  text: string
}

function errorToHebrew(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'מפתח ה-API אינו תקין או שפג תוקפו. בדוק/י את המפתח ונסה/י שוב.'
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return 'אין הרשאה לבצע פעולה זו עם מפתח ה-API הזה.'
  }
  if (err instanceof Anthropic.NotFoundError) {
    return 'המודל המבוקש אינו זמין עבור המפתח הזה.'
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'יותר מדי בקשות כרגע מול Claude. נסה/י שוב בעוד רגע.'
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'בעיית תקשורת מול Claude. בדוק/י את החיבור לאינטרנט ונסה/י שוב.'
  }
  if (err instanceof Anthropic.APIError) {
    return `אירעה שגיאה בפנייה ל-Claude: ${err.message}`
  }
  return 'אירעה שגיאה לא צפויה. נסה/י שוב.'
}

function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <div className="flex flex-1 flex-col justify-center gap-5 px-5 py-8">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <KeyRound size={26} />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-bold text-white">חיבור למאמן ה-AI</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          התכונה הזו פונה ישירות ל-API של Anthropic מהדפדפן שלך, ולכן דורשת מפתח API אישי משלך.
          המפתח נשמר רק בדפדפן הזה ולא נשלח לשום מקום אחר מלבד Anthropic. השימוש מחויב ישירות לחשבון ה-Anthropic שלך.
        </p>
      </div>
      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="text-center text-sm font-semibold text-primary underline"
      >
        יצירת מפתח API בקונסולת Anthropic
      </a>
      <input
        type="password"
        dir="ltr"
        placeholder="sk-ant-..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-12 rounded-xl border border-border bg-surface px-3 text-center text-sm text-white placeholder:text-white/25 focus:border-primary focus:outline-none"
      />
      <Button size="lg" fullWidth disabled={!value.trim()} onClick={() => onSave(value.trim())}>
        שמירה והתחלת שיחה
      </Button>
    </div>
  )
}

export function CoachChat({ routine, equipment, onClose, onRoutineChange }: CoachChatProps) {
  const { apiKey, setApiKey } = useApiKey()
  const [messages, setMessages] = useState<DisplayMessage[]>(() => [
    {
      id: 'greeting',
      role: 'assistant',
      text: `היי! אני המאמן האישי שלך ל-AI. בניתי איתך תוכנית בת ${routine.workoutDays.length} ימי אימון - אני כאן כדי לענות על שאלות ולעזור לך לכוון אותה לפני שתאשר/י אותה. אפשר לבקש ממני להחליף תרגיל, לשנות סטים/חזרות, להוסיף או להסיר תרגיל, או סתם לשאול שאלה.`,
    },
  ])
  const [history, setHistory] = useState<Anthropic.MessageParam[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentRoutine, setCurrentRoutine] = useState(routine)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading || !apiKey) return

    setInput('')
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', text }])
    setLoading(true)

    try {
      const result = await runCoachTurn({
        apiKey,
        equipment,
        routine: currentRoutine,
        history,
        userMessage: text,
      })
      setHistory(result.history)
      setCurrentRoutine(result.routine)
      onRoutineChange(result.routine)
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: result.assistantText }])
    } catch (err) {
      setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: 'error', text: errorToHebrew(err) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      <header className="safe-top sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur">
        <button
          onClick={onClose}
          aria-label="חזרה לתוכנית"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-white/70 active:bg-white/10"
        >
          <ChevronRight size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-base font-extrabold text-white">מאמן AI</p>
            {apiKey && <p className="text-xs text-white/40">מחובר עם מפתח API אישי</p>}
          </div>
        </div>
        {apiKey && (
          <button onClick={() => setApiKey(null)} className="ms-auto text-xs text-white/40 underline">
            שינוי מפתח
          </button>
        )}
      </header>

      {!apiKey ? (
        <ApiKeySetup onSave={setApiKey} />
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'self-end bg-primary text-white'
                      : m.role === 'error'
                        ? 'self-start bg-red-950/60 text-red-300'
                        : 'self-start bg-surface-card text-white/90'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-2xl bg-surface-card px-4 py-2.5 text-sm text-white/50">מקליד/ה…</div>
              )}
            </div>
          </div>

          <div className="safe-bottom flex items-center gap-2 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="כתוב/י הודעה למאמן..."
              disabled={loading}
              className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface-card px-4 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="שליחה"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40"
            >
              <Send size={20} className="-scale-x-100" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
