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
  icon: string
  label: string
}

const FILTER_BUTTONS: FilterButtonConfig[] = [
  { key: 'topic', icon: '📁', label: 'Тема' },
  { key: 'status', icon: '📊', label: 'Статус' },
  { key: 'difficulty', icon: '⭐', label: 'Сложность' },
  { key: 'level', icon: '🎯', label: 'Уровень' },
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
  { value: 'new', label: 'Новые', icon: '❓' },
  { value: 'learning', label: 'В процессе', icon: '📖' },
  { value: 'learned', label: 'Изученные', icon: '✅' },
]

// Difficulty filter options
type DifficultyValue = 1 | 2 | 3
const DIFFICULTY_OPTIONS: FilterOption<DifficultyValue>[] = [
  { value: null, label: 'Любая' },
  { value: 1, label: 'Лёгкие', icon: '⭐' },
  { value: 2, label: 'Средние', icon: '⭐⭐' },
  { value: 3, label: 'Сложные', icon: '⭐⭐⭐' },
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
              flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                isFilterActive(button.key)
                  ? 'bg-primary-500/10 text-primary-300 border border-primary-500/30'
                  : 'bg-white/[0.06] text-white/70 hover:bg-white/[0.08] border border-transparent'
              }
              ${
                openFilter === button.key
                  ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-surface-900'
                  : ''
              }
            `}
            aria-expanded={openFilter === button.key}
            aria-haspopup="listbox"
          >
            <span>{button.icon}</span>
            <span className="hidden sm:inline">{button.label}</span>
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          title="Сбросить фильтры"
        >
          <span>✕</span>
          <span className="hidden sm:inline">Сбросить</span>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/[0.08] text-white/70">
            {activeFilterCount}
          </span>
        </button>
      )}
    </div>
  )
}
