import { GraduationCap } from 'lucide-react'
import { useTeacherChatStore } from '@/store/teacherChatStore'

/**
 * Floating button in bottom-right corner to open the teacher chat.
 * Shows a badge with unread count when there are unread responses.
 */
export default function TeacherChatButton() {
  const { toggleChat, unreadCount, isOpen, isMinimized } = useTeacherChatStore()

  // Don't show button when chat is open and not minimized
  if (isOpen && !isMinimized) {
    return null
  }

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all transition-transform hover:scale-105 duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 focus:ring-offset-primary-900"
      aria-label="Открыть чат с учителем"
    >
      <GraduationCap className="w-6 h-6" />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-magenta-500 text-white text-xs font-medium flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
