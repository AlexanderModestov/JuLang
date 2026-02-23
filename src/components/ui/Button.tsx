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
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-primary-900 disabled:opacity-40 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white focus:ring-primary-500/50 shadow-glow-cyan hover:shadow-glow-cyan-lg',
      secondary:
        'bg-white/5 hover:bg-white/10 text-primary-200 border border-white/10 hover:border-primary-500/30 focus:ring-primary-500/30',
      ghost:
        'bg-transparent hover:bg-white/5 text-primary-300 hover:text-primary-100 focus:ring-primary-500/30',
      danger:
        'bg-red-500/80 hover:bg-red-500 text-white focus:ring-red-400/50 shadow-glow-magenta',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
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
