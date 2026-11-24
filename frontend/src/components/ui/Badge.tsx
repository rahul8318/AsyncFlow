import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'neutral';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'secondary',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-50/80 text-blue-700 border-blue-200/80',
    secondary: 'bg-zinc-100 text-zinc-700 border-zinc-200/80',
    neutral: 'bg-zinc-50 text-zinc-600 border-zinc-200/70',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    outline: 'border-zinc-200 bg-white text-zinc-700',
  };

  const dotColors = {
    primary: 'bg-blue-600',
    secondary: 'bg-zinc-500',
    neutral: 'bg-zinc-400',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    outline: 'bg-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
