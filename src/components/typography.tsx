import React, { forwardRef } from 'react';
import clsx from 'clsx';

export const H1 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'h1'>>(
  (props, ref) => {
    const { className, ...headingProps } = props;
    return (
      <h1
        ref={ref}
        {...headingProps}
        className={clsx('text-2xl mt-4 mb-1 font-semibold', className)}
      />
    );
  }
);
H1.displayName = 'H1';

export const H2 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'h2'>>(
  (props, ref) => {
    const { className, ...headingProps } = props;
    return (
      <h2
        ref={ref}
        {...headingProps}
        className={clsx('text-xl mt-3 mb-1 font-semibold', className)}
      />
    );
  }
);
H2.displayName = 'H2';

export const H3 = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'h3'>>(
  (props, ref) => {
    const { className, ...headingProps } = props;
    return (
      <h3
        ref={ref}
        {...headingProps}
        className={clsx('text-lg mt-2 mb-0.5 font-semibold', className)}
      />
    );
  }
);
H3.displayName = 'H3';

export const Small = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'span'>>(
  (props, ref) => {
    const { className, ...restProps } = props;
    return (
      <span
        ref={ref}
        {...restProps}
        className={clsx('font-normal text-sm leading-5 transition', className)}
      />
    );
  }
);
Small.displayName = 'Small';
