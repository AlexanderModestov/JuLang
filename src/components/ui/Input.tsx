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
            className="block text-sm font-medium text-white/60 mb-1.5 tracking-wide"
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
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
            ${
              error
                ? 'border-danger-500/50 focus:ring-danger-500/50'
                : 'border-white/[0.10]'
            }
            bg-white/[0.05] backdrop-blur-sm
            text-white
            placeholder-white/30
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-white/[0.07] hover:border-white/[0.15]
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-danger-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-white/40">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
