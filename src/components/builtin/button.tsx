import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {}

// TODO: Button kinds
// TODO: Package other RemNote core components
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props) => {
  const { children, className, ...buttonProps } = props;
  return (
    <button
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
        className
      )}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export default Button;
