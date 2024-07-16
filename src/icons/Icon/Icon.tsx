import React, { PropsWithChildren } from 'react';

import { classname } from '@/utils/classname';

import classes from './Icon.module.scss';

export type IconProps = React.SVGAttributes<SVGElement> & {
  className?: string;
  color?: 'primary' | 'secondary' | 'accent';
  //ref?: RefObject<SVGSVGElement>;
};

const cnIcon = classname(classes, 'icon');

const Icon: React.FC<PropsWithChildren & IconProps> = ({
  className,
  color,
  width = 24,
  height = 24,
  children,
  fill = 'none',
  ...props
}) => (
  <svg
    {...props}
    className={cnIcon({ color }) + ` ${className}`}
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    width={width}
    height={height}
  >
    {children}
  </svg>
);

export default Icon;
