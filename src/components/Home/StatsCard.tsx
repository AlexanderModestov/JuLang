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
      className={`flex-1 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-4 shadow-glass ${className}`}
      {...props}
    >
      <div className="flex flex-col items-center text-center gap-1">
        <span className="text-2xl">{icon}</span>
        <span className="text-xl font-bold text-white">
          {value}
        </span>
        <span className="text-xs text-primary-400/60">
          {label}
        </span>
      </div>
    </div>
  )
}
