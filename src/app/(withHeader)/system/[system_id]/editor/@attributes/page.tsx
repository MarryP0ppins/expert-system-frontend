'use client';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import { getAttributesWithValues } from '@/api/services/attributes';
import AttributeField from '@/components/AttributeField';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import { ATTRIBUTES } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import { TResponseAttributePageMutate } from '@/types/attributePage';
import {
  TAttributeWithAttributeValues,
  TAttributeWithAttributeValuesForForm,
  TAttributeWithAttributeValuesForm,
} from '@/types/attributes';
import {
  handleFormSubmit,
  normilizeAttributeWithAttributevalue,
  normilizeResponseDataAttributeWithAttributevalue,
} from '@/utils/attributeWithAttributeValuePage';
import { classname } from '@/utils/classname';
import { objectPromiseAll } from '@/utils/objectPromiseAll';
import { formAttributeWithAttributeValuesValidation } from '@/validation/attributes';

import classes from './page.module.scss';

const cnAttributes = classname(classes, 'editor-attributes');

type PageProps = {
  params: { system_id: number };
};

const Page: React.FC<PageProps> = ({ params }) => {
  const queryClient = useQueryClient();
  const system_id = useMemo(() => Number(params.system_id), [params]);

  const { data, isLoading } = useSuspenseQuery({
    queryKey: [ATTRIBUTES.GET, { system: system_id }],
    queryFn: () => getAttributesWithValues(system_id),
    select: (data) => normilizeResponseDataAttributeWithAttributevalue(data),
  });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isValid, dirtyFields },
  } = useForm<TAttributeWithAttributeValuesForm>({
    resolver: zodResolver(formAttributeWithAttributeValuesValidation),
    defaultValues: data,
    mode: 'all',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (responseList: TResponseAttributePageMutate) => objectPromiseAll(responseList),
    onSuccess: (data) => {
      const newData = normilizeAttributeWithAttributevalue(getValues(), data);
      reset(normilizeResponseDataAttributeWithAttributevalue(newData));
      queryClient.setQueryData<TAttributeWithAttributeValues[]>([ATTRIBUTES.GET, { system: system_id }], newData);
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'formData', keyName: 'arrayId' });

  const isFormDirty = useCallback(() => {
    const currentValues = getValues('formData');
    const isDirtyForm = dirtyFields.formData?.some((attribute, attributeIndex) => {
      const currentAttribute = currentValues[attributeIndex];
      if (attribute.id || attribute.name || attribute.system_id || currentAttribute.deleted) {
        return true;
      }
      return attribute.values?.some(
        (value, valueIndex) => Object.values(value).some((val) => val) || currentAttribute.values[valueIndex].deleted,
      );
    });

    return isDirtyForm;
  }, [dirtyFields.formData, getValues]);

  const handleAddAttr = useCallback(
    () => append({ id: -1, system_id: system_id, name: '', values: [], deleted: false }),
    [append, system_id],
  );
  const handleDeleteAttr = useCallback(
    (attr: TAttributeWithAttributeValuesForForm, attrIndex: number) => () => {
      if (attr.id === -1) {
        remove(attrIndex);
      } else {
        update(attrIndex, { ...attr, deleted: true });
      }
    },
    [remove, update],
  );

  return (
    <main className={cnAttributes()}>
      <form onSubmit={handleSubmit(handleFormSubmit(dirtyFields, mutate))} className={cnAttributes('form')}>
        {fields.map((attribute, attrIndex) => (
          <AttributeField
            key={attribute.arrayId}
            isVisible={!attribute.deleted}
            attributeId={attribute.id}
            control={control}
            index={attrIndex}
            onDelete={handleDeleteAttr(attribute, attrIndex)}
          />
        ))}
        <div className={cnAttributes('newAttr')}>
          <AddIcon width={30} height={30} className={cnAttributes('newAttr-addIcon')} onClick={handleAddAttr} />
          <Input className={cnAttributes('newAttr-input')} onClick={handleAddAttr} placeholder="Новый атрибут" />
        </div>
        <div className={cnAttributes('loadingScreen', { enabled: isLoading || isPending })} />
        <Button
          className={cnAttributes('submitButton', { visible: isFormDirty() })}
          disabled={isLoading || isPending || !isValid}
          loading={isLoading || isPending}
        >
          Сохранить
        </Button>
      </form>
    </main>
  );
};
// я люблю никиту гордеева сииииииииииииииииииииииииильно!!
export default dynamic(() => Promise.resolve(Page), { ssr: false, loading: () => <Loader sizepx={116} /> });
