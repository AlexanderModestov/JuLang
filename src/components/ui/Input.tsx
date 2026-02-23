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
            className="block text-sm font-medium text-primary-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...autoCorrectProps}
          className={`
            w-full px-4 py-2
            rounded-lg
            transition-all duration-200
            bg-white/[0.04] border border-white/[0.08]
            text-primary-50 placeholder-primary-400/60
            focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20
            ${error ? 'border-red-400/60 focus:ring-red-400/30 focus:border-red-400/60' : ''}
            disabled:opacity-40 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-primary-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
