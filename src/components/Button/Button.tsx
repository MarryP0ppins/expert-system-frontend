import React, { PropsWithChildren, RefObject, useCallback } from 'react';

import { classname } from '@/utils/classname';

import Loader from '../Loader';
import Text, { TEXT_TAG, TEXT_VIEW } from '../Text';

import classes from './Button.module.scss';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren & {
    /** Состояние загрузки */
    loading?: boolean;
    /** Текст кнопки */
    ref?: RefObject<HTMLButtonElement>;
  };

const cnButton = classname(classes, 'button');

const Button: React.FC<ButtonProps> = ({ loading, children, className, disabled, onClick, ...props }) => {
  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClick?.(e);
    },
    [onClick],
  );
  return (
    <button
      {...props}
      className={cnButton({ loading, disabled }) + ` ${className}`}
      disabled={disabled || loading}
      onClick={handleOnClick}
    >
      {loading && <Loader size="s" className={cnButton('loader', { disabled })} />}
      <Text tag={TEXT_TAG.span} view={TEXT_VIEW.button}>
        {children}
      </Text>
    </button>
  );
};

export default Button;
