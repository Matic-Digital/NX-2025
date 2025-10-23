import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import type { VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-hidden cursor-pointer focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'border border-primary bg-gradient-to-b from-[#E54800] to-primary text-text-on-primary font-medium shadow-sm hover:from-[#CC4000] hover:to-primary/90',
        secondary: 'bg-secondary text-text-on-secondary shadow-xs hover:bg-secondary/80',
        white:
          'border border-white text-black shadow-xs bg-white hover:bg-black hover:text-white hover:border-transparent',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-input text-text-body shadow-xs hover:bg-white hover:text-black hover:border-white dark:hover:bg-white dark:hover:text-black dark:hover:border-white',
        outlineWhite:
          'border border-white text-white shadow-xs bg-transparent hover:bg-white hover:text-black hover:border-white',
        outlineTrasparentWhite:
          'border border-white text-white shadow-xs bg-transparent hover:bg-white hover:text-black hover:border-white',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'px-7 py-3',
        sm: 'px-3 py-3 text-xs',
        lg: 'px-8 py-3',
        xl: 'px-8 py-3',
        icon: 'size-9'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
