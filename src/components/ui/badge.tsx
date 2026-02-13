import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-[#A8E6CF] text-green-800',
  warning: 'bg-[#F9E79F] text-yellow-800',
  error: 'bg-[#F4C2C2] text-red-800',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
