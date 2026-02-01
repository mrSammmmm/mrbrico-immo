import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'orange' | 'blue' | 'green' | 'red' | 'purple'
  className?: string
}

const colorClasses = {
  orange: {
    bg: 'bg-mrbrico-orange/10',
    icon: 'text-mrbrico-orange',
    trend: 'text-mrbrico-orange',
  },
  blue: {
    bg: 'bg-mrbrico-blue/10',
    icon: 'text-mrbrico-blue',
    trend: 'text-mrbrico-blue',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    trend: 'text-green-600',
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    trend: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    trend: 'text-purple-600',
  },
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'orange',
  className,
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={cn('card-hover', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-mrbrico-gray">{value}</p>
            {trend && (
              <p
                className={cn(
                  'mt-1 text-xs',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mois dernier
              </p>
            )}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', colors.bg)}>
            <Icon className={cn('h-6 w-6', colors.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
