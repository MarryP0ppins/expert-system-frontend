'use client';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import {
  createAttributesWithValues,
  deleteAttributes,
  getAttributesWithValues,
  updateAttributes,
} from '@/api/services/attributes';
import { createAttributesValues, deleteAttributesValues, updateAttributesValues } from '@/api/services/attributeValues';
import AttributeField from '@/components/AttributeField';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import { ATTRIBUTES } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import { TResponseAttributePageMutate } from '@/types/attributePage';
import {
  TAttributeUpdate,
  TAttributeWithAttributeValues,
  TAttributeWithAttributeValuesForForm,
  TAttributeWithAttributeValuesForm,
  TAttributeWithAttributeValuesNew,
} from '@/types/attributes';
import { TAttributeValueNew, TAttributeValueUpdate } from '@/types/attributeValues';
import {
  classname,
  normilizeAttributeWithAttributevalue,
  normilizeResponseDataAttributeWithAttributevalue,
  objectPromiseAll,
} from '@/utils';
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
    const currentValues = getValues();
    const isDirtyForm = dirtyFields.formData?.some((attribute, attributeIndex) => {
      const currentAttribute = currentValues.formData[attributeIndex];
      if (attribute.id || attribute.name || attribute.system_id || currentAttribute.deleted) {
        return true;
      }
      return attribute.values?.some(
        (value, valueIndex) => Object.values(value).some((val) => val) || currentAttribute.values[valueIndex].deleted,
      );
    });

    return isDirtyForm;
  }, [dirtyFields.formData, getValues]);

  const handleFormSubmit = useCallback(
    (form: TAttributeWithAttributeValuesForm) => {
      const attrUpdate: TAttributeUpdate[] = [];
      const attrValueUpdate: TAttributeValueUpdate[] = [];
      const attrNew: TAttributeWithAttributeValuesNew[] = [];
      const attrValueNew: TAttributeValueNew[] = [];
      const atttributeDelete: number[] = [];
      const attrValueDelete: number[] = [];

      form.formData.forEach((attribute, attrIndex) => {
        if (attribute.deleted) {
          atttributeDelete.push(attribute.id);
          return;
        }
        const newValuesNewAttribute: string[] = [];
        attribute.values.forEach((attrValue, attrValueIndex) => {
          if (!attrValue.deleted) {
            if (attrValue.id === -1) {
              if (attrValue.attribute_id === -1) {
                newValuesNewAttribute.push(attrValue.value);
              } else {
                attrValueNew.push({ attribute_id: attrValue.attribute_id, value: attrValue.value });
              }
            }
            if (
              !dirtyFields.formData?.[attrIndex]?.values?.[attrValueIndex]?.id &&
              dirtyFields.formData?.[attrIndex]?.values?.[attrValueIndex]?.value
            ) {
              attrValueUpdate.push({ id: attrValue.id, value: attrValue.value });
            }
          } else if (!attribute.deleted) {
            attrValueDelete.push(attrValue.id);
          }
        });

        if (attribute.id === -1) {
          attrNew.push({ system_id: attribute.system_id, name: attribute.name, values_name: newValuesNewAttribute });
        }
        if (!dirtyFields.formData?.[attrIndex]?.id && dirtyFields.formData?.[attrIndex]?.name) {
          attrUpdate.push({ id: attribute.id, name: attribute.name });
        }
      });

      const responses: TResponseAttributePageMutate = {};
      if (attrNew.length) {
        responses.createAttributesWithValues = createAttributesWithValues(attrNew);
      }
      if (attrUpdate.length) {
        responses.updateAttributes = updateAttributes(attrUpdate);
      }
      if (attrValueNew.length) {
        responses.createAttributesValues = createAttributesValues(attrValueNew);
      }
      if (attrValueUpdate.length) {
        responses.updateAttributesValues = updateAttributesValues(attrValueUpdate);
      }
      if (atttributeDelete.length) {
        responses.deleteAttributes = deleteAttributes(atttributeDelete);
      }
      if (attrValueDelete.length) {
        responses.deleteAttributesValues = deleteAttributesValues(attrValueDelete);
      }

      mutate(responses);
    },
    [dirtyFields, mutate],
  );
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className={cnAttributes('form')}>
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
