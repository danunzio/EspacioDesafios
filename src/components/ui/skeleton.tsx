import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl sm:rounded-3xl',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses[variant], className)}
            style={style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
        >
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="flex gap-4 p-3 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-3 border-b border-gray-50">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10 sm:w-12 sm:h-12" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 sm:w-24 mb-2" />
          <Skeleton className="h-6 w-12 sm:w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton variant="circular" className="w-10 h-10" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" className="w-6 h-6" />
          <Skeleton className="h-5 w-40" />
        </div>
        <SkeletonList count={4} />
      </div>
    </div>
  )
}

export function SkeletonProfessionalList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton variant="circular" className="w-8 h-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonChildrenList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={cn('w-full', height)}>
      <div className="flex items-end justify-around h-full gap-2 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton 
              className={cn('w-full', i % 2 === 0 ? 'h-24' : 'h-16')} 
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonPieChart({ size = 'w-48 h-48' }: { size?: string }) {
  return (
    <div className="flex items-center justify-center">
      <Skeleton variant="circular" className={size} />
    </div>
  )
}

export function SkeletonStatistics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <SkeletonChart />
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <SkeletonPieChart />
        </div>
      </div>
    </div>
  )
}

export function SkeletonLiquidations() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <SkeletonProfessionalList count={4} />
    </div>
  )
}

export function SkeletonPayments() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <SkeletonList count={5} />
    </div>
  )
}

export function SkeletonValues() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="bg-white rounded-2xl p-2">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    </div>
  )
}

export function SkeletonSessions() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <SkeletonList count={4} />
      </div>
    </div>
  )
}

export function SkeletonExpenses() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <SkeletonList count={4} />
      </div>
    </div>
  )
}
