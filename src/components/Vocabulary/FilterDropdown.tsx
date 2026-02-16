import { useRef, useEffect } from 'react'
import { Check } from 'lucide-react'

export interface FilterOption<T> {
  value: T | null
  label: string
  icon?: React.ReactNode
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
      className="absolute top-full left-0 mt-1 z-50 min-w-[160px] py-1 rounded-xl shadow-lg bg-surface-1 border border-border-subtle animate-scale-in"
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
                  ? 'bg-accent-subtle text-accent font-medium'
                  : 'text-text-secondary hover:bg-surface-2'
              }
            `}
          >
            {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {isSelected && (
              <Check size={14} className="ml-auto text-accent" />
            )}
          </button>
        )
      })}
    </div>
  )
}
