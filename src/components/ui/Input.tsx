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
            className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...autoCorrectProps}
          className={`
            w-full px-4 py-2.5
            border rounded-xl
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
            ${
              error
                ? 'border-error focus:ring-error/30'
                : 'border-border'
            }
            bg-surface-1
            text-text-primary
            placeholder-text-muted
            disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
