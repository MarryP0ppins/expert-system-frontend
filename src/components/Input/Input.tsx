import React, { RefObject } from 'react';
import { RefCallBack } from 'react-hook-form';

import { classname } from '@/utils/classname';

import Text, { TEXT_TAG, TEXT_VIEW } from '../Text';

import classes from './Input.module.scss';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Слот для иконки справа */
  afterSlot?: React.ReactNode;
  error?: boolean;
  label?: string;
  labelTitle?: string;
  ref?: RefObject<HTMLInputElement> | RefCallBack;
};

const cnInput = classname(classes, 'input');

const Input: React.FC<InputProps> = ({
  afterSlot,
  className,
  type = 'text',
  error,
  label,
  labelTitle,
  readOnly,
  ref,
  ...props
}) => {
  return (
    <Text
      tag={TEXT_TAG.div}
      view={TEXT_VIEW.p16}
      className={cnInput('container', { error: !!error }) + ` ${className}`}
    >
      <div className={cnInput('label', { visible: !!label })} title={labelTitle}>
        {label}
      </div>
      <input {...props} ref={ref} type={type} readOnly={readOnly} className={cnInput({ readOnly })} />
      {afterSlot}
    </Text>
  );
};

export default Input;
