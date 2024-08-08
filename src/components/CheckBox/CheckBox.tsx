import React, { RefObject } from 'react';
import { RefCallBack } from 'react-hook-form';

import CheckIcon from '@/icons/CheckIcon';
import { classname } from '@/utils/classname';

import classes from './CheckBox.module.scss';

export type CheckBoxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: RefObject<HTMLInputElement> | RefCallBack;
};

const cnCheckBox = classname(classes, 'checkbox');

const CheckBox: React.FC<CheckBoxProps> = ({ className, ...props }) => (
  <label className={cnCheckBox('container') + ` ${className}`}>
    <input {...props} type="checkbox" className={cnCheckBox()} />
    <CheckIcon className={cnCheckBox('icon')} />
  </label>
);

export default CheckBox;
