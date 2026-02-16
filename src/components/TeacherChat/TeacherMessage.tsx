import type { TeacherMessage as TeacherMessageType } from '@/types'

interface TeacherMessageProps {
  message: TeacherMessageType
}

/**
 * Individual message bubble for the teacher chat.
 * User messages are right-aligned with accent color.
 * Assistant messages are left-aligned with surface background.
 */
export default function TeacherMessage({ message }: TeacherMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
          isUser
            ? 'bg-accent text-text-inverse rounded-br-sm'
            : 'bg-surface-2 text-text-primary rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser
              ? 'text-text-inverse/60'
              : 'text-text-muted'
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
