import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-violet-600/30 bg-violet-600/10 text-violet-400',
        safe: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-400',
        caution: 'border-amber-600/30 bg-amber-600/10 text-amber-400',
        danger: 'border-orange-600/30 bg-orange-600/10 text-orange-400',
        critical: 'border-red-600/30 bg-red-600/10 text-red-400',
        outline: 'border-white/20 text-white/70',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
