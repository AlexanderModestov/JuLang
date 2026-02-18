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
      className="absolute top-full left-0 mt-1 z-50 min-w-[160px] py-1 rounded-xl shadow-glass bg-white/[0.05] border border-white/[0.08] backdrop-blur-lg"
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
                  ? 'bg-primary-500/10 text-primary-300 font-medium'
                  : 'text-white/70 hover:bg-white/[0.08]'
              }
            `}
          >
            {option.icon && <span>{option.icon}</span>}
            <span>{option.label}</span>
            {isSelected && (
              <span className="ml-auto text-primary-400">
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
