import type { TeacherMessage as TeacherMessageType } from '@/types'

interface TeacherMessageProps {
  message: TeacherMessageType
}

/**
 * Individual message bubble for the teacher chat.
 * User messages are right-aligned with dark background.
 * Assistant messages are left-aligned with light background.
 */
export default function TeacherMessage({ message }: TeacherMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm transition-smooth ${
          isUser
            ? 'bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 rounded-br-sm'
            : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-50 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser
              ? 'text-stone-400 dark:text-stone-500'
              : 'text-stone-400 dark:text-stone-500'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

/**
 * Format timestamp to HH:MM
 */
function formatTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
