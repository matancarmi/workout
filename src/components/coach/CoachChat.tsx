import Anthropic from '@anthropic-ai/sdk'
import { KeyRound, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { runCoachTurn } from '../../lib/aiCoach'
import { useApiKey } from '../../hooks/useApiKey'
import type { Equipment, Routine } from '../../types'

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
    <div className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto px-5 py-6">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-2 ring-yellow-300">
          <KeyRound size={24} />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-base font-bold text-slate-900">חיבור למאמן ה-AI</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          התכונה הזו פונה ישירות ל-API של Anthropic מהדפדפן שלך, ולכן דורשת מפתח API אישי משלך.
          המפתח נשמר רק בדפדפן הזה ולא נשלח לשום מקום אחר מלבד Anthropic. השימוש מחויב ישירות לחשבון ה-Anthropic שלך.
        </p>
      </div>
      <a
        href="https://console.anthropic.com/settings/keys"
        target="_blank"
        rel="noopener noreferrer"
        className="text-center text-xs font-semibold text-blue-600 underline"
      >
        יצירת מפתח API בקונסולת Anthropic
      </a>
      <input
        type="password"
        dir="ltr"
        placeholder="sk-ant-..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
      />
      <button
        disabled={!value.trim()}
        onClick={() => onSave(value.trim())}
        className="h-12 rounded-xl bg-blue-600 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
      >
        שמירה והתחלת שיחה
      </button>
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
    <div
      className="fixed inset-x-3 bottom-3 top-28 z-50 flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl
        sm:inset-x-auto sm:top-auto sm:start-4 sm:bottom-4 sm:h-[600px] sm:max-h-[80vh] sm:w-[380px]"
    >
      <header className="flex shrink-0 items-center gap-3 bg-blue-600 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-yellow-300">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-white">מאמן AI</p>
          {apiKey && <p className="truncate text-[11px] text-blue-100">מחובר עם מפתח API אישי</p>}
        </div>
        {apiKey && (
          <button onClick={() => setApiKey(null)} className="ms-auto shrink-0 text-[11px] text-blue-100 underline">
            שינוי מפתח
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="סגירת הצ׳אט"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white active:bg-white/25"
        >
          <X size={16} />
        </button>
      </header>

      {!apiKey ? (
        <ApiKeySetup onSave={setApiKey} />
      ) : (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-3">
            <div className="flex flex-col gap-2.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'self-end bg-blue-600 text-white'
                      : m.role === 'error'
                        ? 'self-start border border-red-200 bg-red-50 text-red-700'
                        : 'self-start border border-blue-100 bg-blue-50 text-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="self-start rounded-2xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-[13px] text-blue-400">
                  מקליד/ה…
                </div>
              )}
            </div>
          </div>

          <div className="safe-bottom flex shrink-0 items-center gap-2 border-t border-blue-100 bg-white px-3 py-2.5">
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
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="שליחה"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white ring-2 ring-yellow-300/60 disabled:opacity-40 disabled:ring-0"
            >
              <Send size={18} className="-scale-x-100" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
