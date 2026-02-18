import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-300'

    const variants = {
      default:
        'bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]',
      outlined:
        'bg-white/[0.03] backdrop-blur-xl border border-white/[0.12]',
      elevated:
        'bg-white/[0.07] backdrop-blur-xl border border-white/[0.10] shadow-glass hover:shadow-glass-lg hover:bg-white/[0.09] hover:border-white/[0.15]',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
    }

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
