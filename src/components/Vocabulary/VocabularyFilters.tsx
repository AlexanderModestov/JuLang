import { useState } from 'react'
import type { VocabularyTopic, FrenchLevel } from '@/types'
import { vocabularyTopicLabels } from '@/types'
import FilterDropdown, { type FilterOption } from './FilterDropdown'
import type { VocabularyFilters as FiltersType } from '@/hooks/useVocabularyFilters'

interface VocabularyFiltersProps {
  filters: FiltersType
  onFilterChange: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void
  onClearFilters: () => void
  activeFilterCount: number
}

type FilterKey = 'topic' | 'status' | 'difficulty' | 'level'

interface FilterButtonConfig {
  key: FilterKey
  label: string
}

const FILTER_BUTTONS: FilterButtonConfig[] = [
  { key: 'topic', label: 'Тема' },
  { key: 'status', label: 'Статус' },
  { key: 'difficulty', label: 'Сложность' },
  { key: 'level', label: 'Уровень' },
]

// Topic filter options
const TOPIC_OPTIONS: FilterOption<VocabularyTopic>[] = [
  { value: null, label: 'Все темы' },
  ...Object.entries(vocabularyTopicLabels).map(([value, label]) => ({
    value: value as VocabularyTopic,
    label,
  })),
]

// Status filter options
type StatusValue = 'new' | 'learning' | 'learned'
const STATUS_OPTIONS: FilterOption<StatusValue>[] = [
  { value: null, label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'learning', label: 'В процессе' },
  { value: 'learned', label: 'Изученные' },
]

// Difficulty filter options
type DifficultyValue = 1 | 2 | 3
const DIFFICULTY_OPTIONS: FilterOption<DifficultyValue>[] = [
  { value: null, label: 'Любая' },
  { value: 1, label: 'Лёгкие' },
  { value: 2, label: 'Средние' },
  { value: 3, label: 'Сложные' },
]

// Level filter options
const LEVELS: FrenchLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LEVEL_OPTIONS: FilterOption<FrenchLevel>[] = [
  { value: null, label: 'Все уровни' },
  ...LEVELS.map((level) => ({
    value: level,
    label: level,
  })),
]

function getOptionsForFilter(key: FilterKey): FilterOption<any>[] {
  switch (key) {
    case 'topic':
      return TOPIC_OPTIONS
    case 'status':
      return STATUS_OPTIONS
    case 'difficulty':
      return DIFFICULTY_OPTIONS
    case 'level':
      return LEVEL_OPTIONS
    default:
      return []
  }
}

export default function VocabularyFilters({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: VocabularyFiltersProps) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)

  const handleFilterClick = (key: FilterKey) => {
    setOpenFilter(openFilter === key ? null : key)
  }

  const handleFilterChange = (key: FilterKey, value: any) => {
    onFilterChange(key, value)
  }

  const isFilterActive = (key: FilterKey): boolean => {
    return filters[key] !== null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Filter buttons */}
      {FILTER_BUTTONS.map((button) => (
        <div key={button.key} className="relative">
          <button
            onClick={() => handleFilterClick(button.key)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-smooth
              ${
                isFilterActive(button.key)
                  ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-800/40'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-transparent'
              }
              ${
                openFilter === button.key
                  ? 'ring-2 ring-accent-500/20 ring-offset-1 dark:ring-offset-stone-950'
                  : ''
              }
            `}
            aria-expanded={openFilter === button.key}
            aria-haspopup="listbox"
          >
            <span className="hidden sm:inline">{button.label}</span>
            <span className="sm:hidden">{button.label}</span>
          </button>

          {openFilter === button.key && (
            <FilterDropdown
              options={getOptionsForFilter(button.key)}
              value={filters[button.key]}
              onChange={(value) => handleFilterChange(button.key, value)}
              onClose={() => setOpenFilter(null)}
            />
          )}
        </div>
      ))}

      {/* Clear filters button */}
      {activeFilterCount > 0 && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-smooth"
          title="Сбросить фильтры"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Сбросить</span>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
            {activeFilterCount}
          </span>
        </button>
      )}
    </div>
  )
}
