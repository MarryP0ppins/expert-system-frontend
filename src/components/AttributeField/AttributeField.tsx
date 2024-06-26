import React, { useCallback } from 'react';
import { Control, useController, useFieldArray } from 'react-hook-form';

import AddIcon from '@/icons/AddIcon';
import CloseIcon from '@/icons/CloseIcon';
import { TAttributeWithAttributeValuesForm } from '@/types/attributes';
import { TAttributeValueForForm } from '@/types/attributeValues';
import { classname } from '@/utils/classname';

import ErrorPopup from '../ErrorPopup';
import Input from '../Input';

import AttrValue from './SubField/AttrValue';

import classes from './AttributeField.module.scss';

type AttributeFieldProps = {
  isVisible?: boolean;
  attributeId: number;
  index: number;
  control: Control<TAttributeWithAttributeValuesForm>;
  onDelete: () => void;
};

const cnFields = classname(classes, 'fieldWithFields');

const AttributeField: React.FC<AttributeFieldProps> = ({ isVisible = true, control, index, attributeId, onDelete }) => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: `formData.${index}.name` });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `formData.${index}.values`,
    keyName: 'arrayId',
  });

  const handleDeleteAttrValue = useCallback(
    (attrValue: TAttributeValueForForm, attrValueIndex: number) => () => {
      if (attrValue.id === -1) {
        remove(attrValueIndex);
      } else {
        update(attrValueIndex, { ...attrValue, deleted: true });
      }
    },
    [remove, update],
  );
  const handleAddAttrValue = useCallback(
    () => append({ id: -1, attribute_id: attributeId, value: '', deleted: false }),
    [append, attributeId],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cnFields()}>
      <CloseIcon width={30} height={30} className={cnFields('delete')} onClick={onDelete} />
      <Input
        {...field}
        className={cnFields('input')}
        label="Имя атрибута"
        placeholder="Имя атрибута"
        afterSlot={<ErrorPopup error={error?.message} position="top right" offsetY={4} />}
        error={!!error}
      />
      <div className={cnFields('attrValues')}>
        {fields.map((attrValue, attrValueIndex) => (
          <AttrValue
            key={attrValue.arrayId}
            isVisible={!attrValue.deleted}
            control={control}
            attrIndex={index}
            attrValueIndex={attrValueIndex}
            onDeleteClick={handleDeleteAttrValue(attrValue, attrValueIndex)}
          />
        ))}
        <div className={cnFields('newValue')} key="new-attrValue">
          <AddIcon width={30} height={30} className={cnFields('newValue-addIcon')} onClick={handleAddAttrValue} />
          <Input
            className={cnFields('newValue-input')}
            placeholder="Добавить значение атрибута"
            onClick={handleAddAttrValue}
          />
        </div>
      </div>
    </div>
  );
};

export default AttributeField;
