import React from 'react';
import { Control, useController } from 'react-hook-form';

import ErrorPopup from '@/components/ErrorPopup';
import TrashIcon from '@/icons/TrashIcon';
import { TAttributeWithAttributeValuesForm } from '@/types/attributes';
import { classname } from '@/utils';

import Input from '../../Input';

import classes from './AttrValue.module.scss';

type AttrValueProps = {
  isVisible?: boolean;
  attrIndex: number;
  attrValueIndex: number;
  control: Control<TAttributeWithAttributeValuesForm>;
  onDeleteClick: () => void;
};

const cnField = classname(classes, 'attrValue');

const AttrValue: React.FC<AttrValueProps> = ({
  isVisible = true,
  control,
  attrIndex,
  attrValueIndex,
  onDeleteClick,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: `formData.${attrIndex}.values.${attrValueIndex}.value` });

  if (!isVisible) {
    return true;
  }

  return (
    <div className={cnField()}>
      <TrashIcon width={30} height={30} className={cnField('deleteIcon')} onClick={onDeleteClick} />
      <Input
        {...field}
        className={cnField('input')}
        label="Значение"
        placeholder="Значение атрибута"
        afterSlot={<ErrorPopup error={error?.message} position="top right" offsetY={4} />}
        error={!!error}
      />
    </div>
  );
};

export default AttrValue;
