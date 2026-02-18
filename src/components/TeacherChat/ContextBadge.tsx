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
    <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/40 bg-white/[0.06] rounded-md">
      <span className="flex-shrink-0">📍</span>
      <span className="truncate">
        {screenLabel}
        {hasItem && `: ${context.itemPreview}`}
      </span>
    </div>
  )
}
