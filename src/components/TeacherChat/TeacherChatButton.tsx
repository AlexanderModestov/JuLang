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
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 shadow-soft-lg hover:shadow-soft-xl transition-smooth flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-stone-50 dark:focus:ring-offset-stone-900"
      aria-label="Открыть чат с учителем"
    >
      {/* Teacher icon - graduation cap */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
        />
      </svg>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-accent-600 text-white text-xs font-medium flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
