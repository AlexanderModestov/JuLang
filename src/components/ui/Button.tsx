import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-0 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]'

    const variants = {
      primary:
        'bg-accent hover:bg-accent-hover text-text-inverse focus:ring-accent/40',
      secondary:
        'bg-surface-2 hover:bg-surface-3 text-text-primary border border-border-subtle focus:ring-accent/30',
      ghost:
        'bg-transparent hover:bg-surface-2 text-text-secondary hover:text-text-primary focus:ring-accent/30',
      danger:
        'bg-error hover:bg-error-muted text-text-inverse focus:ring-error/40',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs tracking-wide',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
