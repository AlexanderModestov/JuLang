import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  disableAutoCorrect?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, disableAutoCorrect, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    const autoCorrectProps = disableAutoCorrect ? {
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      spellCheck: false,
      'data-gramm': 'false',
      'data-gramm_editor': 'false',
    } : {}

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...autoCorrectProps}
          className={`
            w-full px-4 py-2.5 text-sm
            border rounded-xl
            transition-smooth
            focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
            ${
              error
                ? 'border-danger-500 focus:ring-danger-500/20'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }
            bg-white dark:bg-stone-900
            text-stone-900 dark:text-stone-50
            placeholder-stone-400 dark:placeholder-stone-600
            disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-danger-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
