import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex flex-col p-[1rem] border border-[#d4d4d4] rounded-[0.125rem] w-full placeholder:text-[1rem] placeholder:font-normal placeholder:leading-[120%] placeholder:tracking-[0.002rem]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
