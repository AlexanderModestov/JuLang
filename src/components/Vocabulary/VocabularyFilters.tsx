import { useState } from 'react'
import { FolderOpen, BarChart3, Star, Target, X } from 'lucide-react'
import type { VocabularyTopic, FrenchLevel } from '@/types'
import { vocabularyTopicLabels } from '@/types'
import FilterDropdown, { type FilterOption } from './FilterDropdown'
import type { VocabularyFilters as FiltersType } from '@/hooks/useVocabularyFilters'
import { HelpCircle, BookOpen, CheckCircle2 } from 'lucide-react'

interface VocabularyFiltersProps {
  filters: FiltersType
  onFilterChange: <K extends keyof FiltersType>(key: K, value: FiltersType[K]) => void
  onClearFilters: () => void
  activeFilterCount: number
}

type FilterKey = 'topic' | 'status' | 'difficulty' | 'level'

interface FilterButtonConfig {
  key: FilterKey
  icon: React.ReactNode
  label: string
}

const FILTER_BUTTONS: FilterButtonConfig[] = [
  { key: 'topic', icon: <FolderOpen size={14} />, label: 'Тема' },
  { key: 'status', icon: <BarChart3 size={14} />, label: 'Статус' },
  { key: 'difficulty', icon: <Star size={14} />, label: 'Сложность' },
  { key: 'level', icon: <Target size={14} />, label: 'Уровень' },
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
  { value: 'new', label: 'Новые', icon: <HelpCircle size={14} className="text-accent" /> },
  { value: 'learning', label: 'В процессе', icon: <BookOpen size={14} className="text-warm" /> },
  { value: 'learned', label: 'Изученные', icon: <CheckCircle2 size={14} className="text-success" /> },
]

// Difficulty filter options
type DifficultyValue = 1 | 2 | 3
const DIFFICULTY_OPTIONS: FilterOption<DifficultyValue>[] = [
  { value: null, label: 'Любая' },
  { value: 1, label: 'Лёгкие', icon: <Star size={14} className="text-warm" /> },
  { value: 2, label: 'Средние', icon: <><Star size={14} className="text-warm" /><Star size={14} className="text-warm" /></> },
  { value: 3, label: 'Сложные', icon: <><Star size={14} className="text-warm" /><Star size={14} className="text-warm" /><Star size={14} className="text-warm" /></> },
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
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
              ${
                isFilterActive(button.key)
                  ? 'bg-accent-subtle text-accent border border-accent/30'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3 border border-transparent'
              }
              ${
                openFilter === button.key
                  ? 'ring-2 ring-accent/30 ring-offset-1 ring-offset-surface-0'
                  : ''
              }
            `}
            aria-expanded={openFilter === button.key}
            aria-haspopup="listbox"
          >
            {button.icon}
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all duration-200"
          title="Сбросить фильтры"
        >
          <X size={14} />
          <span className="hidden sm:inline">Сбросить</span>
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-surface-3 text-text-secondary">
            {activeFilterCount}
          </span>
        </button>
      )}
    </div>
  )
}
