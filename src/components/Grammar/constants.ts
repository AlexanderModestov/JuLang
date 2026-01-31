import type { GrammarGroup } from '@/types'

export const groupLabels: Record<GrammarGroup, string> = {
  articles: 'Артикли',
  tenses: 'Времена',
  pronouns: 'Местоимения',
  prepositions: 'Предлоги',
  adjectives: 'Прилагательные',
  negation: 'Отрицание',
  questions: 'Вопросы',
}

// Order for displaying groups
export const groupOrder: GrammarGroup[] = [
  'articles',
  'tenses',
  'pronouns',
  'prepositions',
  'adjectives',
  'negation',
  'questions',
]
