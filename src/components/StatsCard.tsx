import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'gold';
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  delay = 0,
}: StatsCardProps) {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary text-primary-foreground border-primary',
    gold: 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-secondary',
  };

  const iconVariants = {
    default: 'bg-accent text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    gold: 'bg-white/20 text-white',
  };

  const subtitleVariants = {
    default: 'text-muted-foreground',
    primary: 'text-primary-foreground/70',
    gold: 'text-white/70',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 shadow-md',
        variants[variant]
      )}
    >
      {/* Decorative element */}
      <div
        className={cn(
          'absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10',
          variant === 'default' ? 'bg-primary' : 'bg-white'
        )}
      />
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : ''
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold font-serif">{value}</p>
          {subtitle && (
            <p className={cn('text-sm', subtitleVariants[variant])}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
              <span className={subtitleVariants[variant]}>dari bulan lalu</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            iconVariants[variant]
          )}
        >
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
