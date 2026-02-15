import { HTMLAttributes } from 'react'

interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string
  value: string | number
  label: string
  iconColor?: string
}

export default function StatsCard({
  value,
  label,
  className = '',
  ...props
}: StatsCardProps) {
  return (
    <div
      className={`bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl p-4 ${className}`}
      {...props}
    >
      <div className="text-lg font-semibold text-stone-900 dark:text-stone-50">
        {value}
      </div>
      <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
        {label}
      </div>
    </div>
  )
}
