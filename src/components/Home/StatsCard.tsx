import { HTMLAttributes } from 'react'

interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: string
  value: string | number
  label: string
  iconColor?: string
}

export default function StatsCard({
  icon,
  value,
  label,
  iconColor = '#3B82F6',
  className = '',
  ...props
}: StatsCardProps) {
  return (
    <div
      className={`flex-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md ${className}`}
      {...props}
    >
      <div className="flex flex-col items-center text-center gap-1">
        <span className="text-2xl" style={{ color: iconColor }}>
          {icon}
        </span>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
    </div>
  )
}
