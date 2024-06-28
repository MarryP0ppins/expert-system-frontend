import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Control, useFieldArray } from 'react-hook-form';

import CheckBox from '@/components/CheckBox';
import { ArrowDownIcon } from '@/icons';
import { TAttributeValWithActiveNewDelete } from '@/types/attributeValues';
import { TObjectWithAttrValuesForm } from '@/types/objects';
import { classname } from '@/utils/classname';

import { useClickOutside } from '../../../hooks/useClickOutside';
import Input from '../../Input';
import Text, { TEXT_TAG, TEXT_VIEW } from '../../Text';

import classes from './ObjectMultiDropdown.module.scss';

export type ObjectMultiDropdownProps = {
  className?: string;
  control: Control<TObjectWithAttrValuesForm>;
  objectIndex: number;
  attributeIndex: number;
  attributeName: string;
};

const cnObjectMultiDropdown = classname(classes, 'multidropdown');

const ObjectMultiDropdown: React.FC<ObjectMultiDropdownProps> = ({
  className,
  objectIndex,
  attributeIndex,
  control,
  attributeName,
}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);

  const { fields: attributeValuesFields, update } = useFieldArray({
    control,
    name: `formData.${objectIndex}.attributes.${attributeIndex}.values`,
    keyName: 'arrayId',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOnClickInput = useCallback(() => {
    setPopoverVisible((prev) => !prev);
  }, []);

  const handleOnClickOutside = useCallback(() => {
    setPopoverVisible(false);
  }, []);

  useClickOutside(dropdownRef, handleOnClickOutside);

  const inputValue = useMemo(() => {
    return attributeValuesFields.reduce((line, value) => {
      if (value.isActive) {
        if (line.length !== 0) {
          line += '; ';
        }
        line += value.value;
      }
      return line;
    }, '');
  }, [attributeValuesFields]);

  const onValueClick = useCallback(
    (attrValue: TAttributeValWithActiveNewDelete, attrValueIndex: number) => () => {
      update(attrValueIndex, {
        ...attrValue,
        isActive: !attrValue.isActive,
        added: !attrValue.isActive && !attrValue.deleted,
        deleted: attrValue.isActive && !attrValue.added,
      });
    },
    [update],
  );

  return (
    <div className={cnObjectMultiDropdown() + ` ${className}`} ref={dropdownRef}>
      <Input
        value={inputValue}
        readOnly
        afterSlot={
          <ArrowDownIcon
            onClick={handleOnClickInput}
            color="secondary"
            className={cnObjectMultiDropdown('arrow', { popoverVisible })}
          />
        }
        label={attributeName.length > 32 ? attributeName.slice(0, 29).concat('...') : attributeName}
        labelTitle={attributeName}
        placeholder="Значения атрибута"
        onClick={handleOnClickInput}
      />
      {popoverVisible && (
        <div className={cnObjectMultiDropdown('options')}>
          {attributeValuesFields.map((attrValue, attrValueIndex) => (
            <div
              key={attrValue.arrayId}
              onClick={onValueClick(attrValue, attrValueIndex)}
              className={cnObjectMultiDropdown('raw')}
              title={attrValue.value}
            >
              <CheckBox checked={attrValue.isActive} readOnly />
              <Text
                tag={TEXT_TAG.div}
                view={TEXT_VIEW.p16}
                className={cnObjectMultiDropdown('option')}
                color={attrValue.isActive ? 'accent' : 'primary'}
              >
                {attrValue.value}
              </Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectMultiDropdown;
