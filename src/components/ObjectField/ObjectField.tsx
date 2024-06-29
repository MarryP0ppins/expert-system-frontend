import React from 'react';
import { Control, useController } from 'react-hook-form';

import CloseIcon from '@/icons/CloseIcon';
import { TAttributeWithAttrValueForObjects } from '@/types/attributes';
import { TObjectWithAttrValuesForm } from '@/types/objects';
import { classname } from '@/utils/classname';

import ErrorPopup from '../ErrorPopup';
import Input from '../Input';

import ObjectMultiDropdown from './ObjectMultiDropdown';

import classes from './ObjectField.module.scss';

type ObjectFieldProps = {
  isVisible?: boolean;
  objectId: number;
  objectIndex: number;
  control: Control<TObjectWithAttrValuesForm>;
  attributes: TAttributeWithAttrValueForObjects[];
  onDelete: () => void;
};

const cnFields = classname(classes, 'fieldWithFields');

const ObjectField: React.FC<ObjectFieldProps> = ({ isVisible, control, objectIndex, attributes, onDelete }) => {
  const {
    field: bodyField,
    fieldState: { error: bodyError },
  } = useController({ control, name: `formData.${objectIndex}.name` });

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cnFields()}>
      <CloseIcon width={30} height={30} className={cnFields('delete')} onClick={onDelete} />
      <Input
        {...bodyField}
        className={cnFields('input')}
        label="Объект"
        placeholder="Объект"
        afterSlot={<ErrorPopup error={bodyError?.message} position="top right" offsetY={4} />}
        error={!!bodyError}
      />
      <div className={cnFields('line')} />
      <div className={cnFields('attributes')}>
        {attributes.map((attribute, attributeIndex) => (
          <ObjectMultiDropdown
            key={attribute.id}
            attributeName={attribute.name}
            objectIndex={objectIndex}
            attributeIndex={attributeIndex}
            control={control}
          />
        ))}
      </div>
    </div>
  );
};

export default ObjectField;
