import type { TeacherChatContext } from '@/store/teacherChatStore'

interface ContextBadgeProps {
  context: TeacherChatContext
}

/**
 * Maps screen names to Russian display labels
 */
function getScreenLabel(screen: string): string {
  const screenLabels: Record<string, string> = {
    home: 'Главная',
    conversation: 'Разговор',
    grammar: 'Грамматика',
    vocabulary: 'Словарь',
    settings: 'Настройки',
    'grammar-practice': 'Практика грамматики',
    'grammar-review': 'Повторение грамматики',
    'topic-selection': 'Выбор темы',
  }
  return screenLabels[screen] || screen
}

/**
 * Small badge showing current context in the teacher chat widget.
 * Displays the current screen and optionally the item being viewed.
 */
export default function ContextBadge({ context }: ContextBadgeProps) {
  const screenLabel = getScreenLabel(context.screen)
  const hasItem = context.itemId && context.itemPreview

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
      <svg
        className="w-3 h-3 flex-shrink-0 text-stone-400 dark:text-stone-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
      <span className="truncate">
        {screenLabel}
        {hasItem && (
          <>
            <span className="mx-1 text-stone-300 dark:text-stone-600">&middot;</span>
            {context.itemPreview}
          </>
        )}
      </span>
    </div>
  )
}
