import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {}

// TODO: Button kinds
// TODO: Package other RemNote core components
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, className, disabled, ...buttonProps } = props;
  return (
    <button
      ref={ref}
      {...buttonProps}
      className={clsx(
        'rn-button button box-border',
        'rn-button--Outline',
        'rn-text-label-medium',
        'inline-flex flex-row items-center justify-center',
        'text-center select-none cursor-pointer',
        'relative transition-all',
        'py-1.5 px-3 h-8',
        'hover:bg-gray-10 rn-clr-background-primary text-gray-100',
        'rounded-md border border-solid border-gray-15',
        disabled &&
          'rn-clr-background-state-disabled rn-clr-content-state-disabled !cursor-not-allowed',
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export default Button;
