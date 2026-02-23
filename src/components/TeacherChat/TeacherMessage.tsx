import type { TeacherMessage as TeacherMessageType } from '@/types'

interface TeacherMessageProps {
  message: TeacherMessageType
}

/**
 * Individual message bubble for the teacher chat.
 * User messages are right-aligned with primary color.
 * Assistant messages are left-aligned with muted primary background.
 */
export default function TeacherMessage({ message }: TeacherMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-br-sm shadow-glow-cyan'
            : 'bg-white/5 text-primary-100 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isUser
              ? 'text-primary-200'
              : 'text-primary-400/60'
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
