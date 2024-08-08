import React, { RefObject } from 'react';
import { RefCallBack } from 'react-hook-form';

import { classname } from '@/utils/classname';

import Text, { TEXT_TAG, TEXT_VIEW } from '../Text';

import classes from './TextArea.module.scss';

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Слот для иконки справа */
  afterSlot?: React.ReactNode;
  error?: boolean;
  label?: string | boolean;
  ref?: RefObject<HTMLTextAreaElement> | RefCallBack;
};

const cnTextArea = classname(classes, 'textArea');

const TextArea: React.FC<TextAreaProps> = ({ afterSlot, className, error, label, ...props }) => {
  return (
    <Text
      tag={TEXT_TAG.div}
      view={TEXT_VIEW.p16}
      className={cnTextArea('container', { error: !!error }) + ` ${className}`}
    >
      <div className={cnTextArea('label', { visible: !!label })}>{label}</div>
      <textarea {...props} className={cnTextArea()} />
      {afterSlot}
    </Text>
  );
};

export default TextArea;
