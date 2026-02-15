import { useRef, useEffect } from 'react'

export interface FilterOption<T> {
  value: T | null
  label: string
  icon?: string
}

interface FilterDropdownProps<T> {
  options: FilterOption<T>[]
  value: T | null
  onChange: (value: T | null) => void
  onClose: () => void
}

export default function FilterDropdown<T>({
  options,
  value,
  onChange,
  onClose,
}: FilterDropdownProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSelect = (optionValue: T | null) => {
    onChange(optionValue)
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 z-50 min-w-[160px] py-1 rounded-xl shadow-soft-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 animate-scale-in"
    >
      {options.map((option, index) => {
        const isSelected = option.value === value
        return (
          <button
            key={index}
            onClick={() => handleSelect(option.value)}
            className={`
              w-full px-3 py-2 text-left text-sm transition-smooth
              flex items-center gap-2
              ${
                isSelected
                  ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 font-medium'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
              }
            `}
          >
            {option.icon && <span>{option.icon}</span>}
            <span>{option.label}</span>
            {isSelected && (
              <svg className="ml-auto w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
