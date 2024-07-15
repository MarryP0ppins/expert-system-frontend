import React from 'react';

import CheckIcon from '@/icons/CheckIcon';
import { classname } from '@/utils/classname';

import classes from './CheckBox.module.scss';

export type CheckBoxProps = React.InputHTMLAttributes<HTMLInputElement>;

const cnCheckBox = classname(classes, 'checkbox');

const CheckBox = React.forwardRef<HTMLInputElement, CheckBoxProps>(({ className, ...props }, ref) => (
  <label className={cnCheckBox('container') + ` ${className}`}>
    <input {...props} ref={ref} type="checkbox" className={cnCheckBox()} />
    <CheckIcon className={cnCheckBox('icon')} />
  </label>
));

export default CheckBox;
