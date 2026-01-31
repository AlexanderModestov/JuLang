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
      className="absolute top-full left-0 mt-1 z-50 min-w-[160px] py-1 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      {options.map((option, index) => {
        const isSelected = option.value === value
        return (
          <button
            key={index}
            onClick={() => handleSelect(option.value)}
            className={`
              w-full px-3 py-2 text-left text-sm transition-colors
              flex items-center gap-2
              ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            {option.icon && <span>{option.icon}</span>}
            <span>{option.label}</span>
            {isSelected && (
              <span className="ml-auto text-primary-600 dark:text-primary-400">
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
