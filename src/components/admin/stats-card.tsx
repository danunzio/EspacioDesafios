import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  color: 'purple' | 'pink' | 'aqua' | 'yellow' | 'default'
}

const colorStyles = {
  purple: {
    bg: 'bg-[#A38EC3]/15',
    text: 'text-[#A38EC3]',
    icon: 'text-[#8A75AA]',
  },
  pink: {
    bg: 'bg-[#F4C2C2]/15',
    text: 'text-[#E8A5A5]',
    icon: 'text-[#E8A5A5]',
  },
  aqua: {
    bg: 'bg-[#A8E6CF]/15',
    text: 'text-[#8ED9B8]',
    icon: 'text-[#8ED9B8]',
  },
  yellow: {
    bg: 'bg-[#F9E79F]/15',
    text: 'text-[#D4B850]',
    icon: 'text-[#D4B850]',
  },
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: 'text-gray-500',
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'default',
}: StatsCardProps) {
  const styles = colorStyles[color]

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#6B6570] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#2D2A32] truncate">{value}</p>
          <p className={`text-xs mt-1 ${styles.text}`}>{subtitle}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${styles.bg}`}
        >
          <Icon className={styles.icon} size={24} />
        </div>
      </div>
    </div>
  )
}
