import Anthropic from '@anthropic-ai/sdk'
import { EXERCISE_LIBRARY, getExercise, MUSCLE_GROUP_LABELS } from '../data/exerciseLibrary'
import { applyToolCall, COACH_TOOLS } from './coachTools'
import type { Equipment, Routine } from '../types'

const MODEL_ID = 'claude-opus-5'
const MAX_TOOL_ITERATIONS = 6

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  full_gym: 'חדר כושר מלא',
  dumbbells_only: 'משקולות בלבד',
  bodyweight: 'משקל גוף בלבד',
}

function buildLibraryBlock(equipment: Equipment): string {
  const available = EXERCISE_LIBRARY.filter((e) => e.equipment.includes(equipment)).map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: MUSCLE_GROUP_LABELS[e.muscleGroup],
    defaultSets: e.defaultSets,
    defaultReps: e.defaultReps,
  }))

  return [
    'את/ה מאמן/ת כושר אישי מומחה, עם ידע נרחב בפיזיולוגיה של האימון, תכנון תוכניות כוח והיפרטרופיה,',
    'טכניקת ביצוע נכונה, והתאמת אימונים למגבלות אישיות (פציעות, זמן, ציוד).',
    '',
    "המשתמש/ת בונה כרגע תוכנית אימונים באפליקציית 'יומן הברזל' ורוצה להתייעץ איתך לפני אישור התוכנית הסופית.",
    '',
    'תפקידך:',
    '- לענות על שאלות בנושא אימונים, תרגילים, טכניקה, התאוששות ותזונה בסיסית הקשורה לאימונים.',
    '- כאשר מבקשים ממך לשנות את התוכנית (החלפת תרגיל, שינוי סטים/חזרות, הוספה או הסרה של תרגיל) - בצע/י את השינוי בפועל',
    '  דרך הכלים (tools) שברשותך. אל תסתפק/י בתיאור מילולי של השינוי - תמיד תפעיל/י את הכלי המתאים.',
    '- מותר להציע ולהוסיף אך ורק תרגילים מתוך הרשימה ב-EXERCISE_LIBRARY למטה - אלה התרגילים היחידים הקיימים',
    `  במערכת התואמים לציוד שהמשתמש/ת בחר/ה (${EQUIPMENT_LABELS[equipment]}).`,
    '- אחרי כל שינוי, הסבר/י בקצרה מה השתנה ולמה זה הגיוני מבחינה אימונית.',
    '- שמור/י על תשובות תמציתיות, ידידותיות וברורות, מתאימות לצ\'אט בנייד.',
    '- ענה/י תמיד בעברית בלבד, גם אם המשתמש/ת כותב/ת בשפה אחרת.',
    '',
    'EXERCISE_LIBRARY (JSON, התרגילים הזמינים בלבד):',
    JSON.stringify(available),
  ].join('\n')
}

function buildRoutineContextBlock(routine: Routine): string {
  const days = routine.workoutDays.map((day) => ({
    id: day.id,
    name: day.name,
    exercises: day.exercises.map((rex) => ({
      routineExerciseId: rex.id,
      exerciseId: rex.exerciseId,
      exerciseName: getExercise(rex.exerciseId)?.name ?? rex.exerciseId,
      sets: rex.sets,
      repRange: rex.repRange,
    })),
  }))
  return `CURRENT_ROUTINE (JSON, המצב העדכני של התוכנית - עדכן/י את ההפניות לפיו):\n${JSON.stringify({ days })}`
}

export interface CoachTurnResult {
  routine: Routine
  history: Anthropic.MessageParam[]
  assistantText: string
}

export async function runCoachTurn(options: {
  apiKey: string
  equipment: Equipment
  routine: Routine
  history: Anthropic.MessageParam[]
  userMessage: string
}): Promise<CoachTurnResult> {
  const { apiKey, equipment, userMessage } = options
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  let routine = options.routine
  const messages: Anthropic.MessageParam[] = [...options.history, { role: 'user', content: userMessage }]

  const librarySystemBlock: Anthropic.TextBlockParam = {
    type: 'text',
    text: buildLibraryBlock(equipment),
    cache_control: { type: 'ephemeral' },
  }

  let assistantText = ''

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 4096,
      output_config: { effort: 'medium' },
      system: [librarySystemBlock, { type: 'text', text: buildRoutineContextBlock(routine) }],
      tools: COACH_TOOLS,
      messages,
    })

    messages.push({ role: 'assistant', content: response.content })

    const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text')
    assistantText = textBlocks.map((b) => b.text).join('\n').trim() || assistantText

    if (response.stop_reason === 'pause_turn') continue

    const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    if (toolUseBlocks.length === 0) break

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map((block) => {
      const result = applyToolCall(routine, equipment, block.name, block.input)
      if (result.ok) {
        routine = result.routine
      }
      return {
        type: 'tool_result',
        tool_use_id: block.id,
        content: result.message,
        is_error: !result.ok,
      }
    })

    messages.push({ role: 'user', content: toolResults })
  }

  if (!assistantText) {
    assistantText = 'ביצעתי את השינוי המבוקש בתוכנית.'
  }

  return { routine, history: messages, assistantText }
}
