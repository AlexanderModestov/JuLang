import { HTMLAttributes, ReactNode } from 'react'

interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  value: string | number
  label: string
  accentColor?: string
}

export default function StatsCard({
  icon,
  value,
  label,
  accentColor = 'text-primary-400',
  className = '',
  ...props
}: StatsCardProps) {
  return (
    <div
      className={`flex-1 bg-white/[0.04] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.06] hover:border-white/[0.10] transition-all ${className}`}
      {...props}
    >
      <div className="flex flex-col items-center text-center gap-1.5">
        <span className={accentColor}>
          {icon}
        </span>
        <span className="text-lg font-bold text-white/90">
          {value}
        </span>
        <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  )
}
