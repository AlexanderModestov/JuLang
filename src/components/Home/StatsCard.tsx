import { HTMLAttributes, ReactNode } from 'react'

interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  value: string | number
  label: string
}

export default function StatsCard({
  icon,
  value,
  label,
  className = '',
  ...props
}: StatsCardProps) {
  return (
    <div
      className={`flex-1 bg-surface-1 border border-border-subtle rounded-2xl p-4 ${className}`}
      {...props}
    >
      <div className="flex flex-col items-center text-center gap-1">
        <div className="mb-1">
          {icon}
        </div>
        <span className="text-xl font-bold text-text-primary">
          {value}
        </span>
        <span className="text-xs text-text-muted">
          {label}
        </span>
      </div>
    </div>
  )
}
