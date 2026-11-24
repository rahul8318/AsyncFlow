import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'brand';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-lg focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985]';

    const variants = {
      primary:
        'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.12)] border border-zinc-800/80',
      brand:
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-[0_1px_2px_rgba(37,99,235,0.2)] border border-blue-500/80',
      secondary:
        'bg-white text-zinc-800 border border-zinc-200/90 hover:bg-zinc-50 active:bg-zinc-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-300',
      outline:
        'border border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-100/70 hover:text-zinc-900',
      ghost:
        'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm border border-rose-500',
    };

    const sizes = {
      xs: 'text-[11px] h-7 px-2.5 gap-1.5 font-medium tracking-tight',
      sm: 'text-xs h-8 px-3 gap-1.5 font-medium tracking-tight',
      md: 'text-xs h-9 px-3.5 gap-2 font-medium',
      lg: 'text-sm h-11 px-5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
