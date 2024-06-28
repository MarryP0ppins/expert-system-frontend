'use client';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import { getAttributesWithValues } from '@/api/services/attributes';
import {
  createObjectAttributeAttributeValue,
  deleteObjectAttributeAttributeValue,
} from '@/api/services/objectAttributeAttributeValue';
import {
  createObjectWithAttrValues,
  deleteObjects,
  getObjectsWithAttrValues,
  updateObjects,
} from '@/api/services/objects';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import ObjectField from '@/components/ObjectField';
import { ATTRIBUTES, OBJECTS } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import { TAttributeWithAttributeValues, TAttributeWithAttrValueForObjects } from '@/types/attributes';
import { TObjectAttributeAttributeValueNew } from '@/types/objectAttributeAttributeValue';
import { TResponseObjectPageMutate } from '@/types/objectPage';
import { TObjectUpdate, TObjectWithAttrValues, TObjectWithAttrValuesForm, TObjectWithIdsNew } from '@/types/objects';
import { classname } from '@/utils/classname';
import { objectPromiseAll } from '@/utils/objectPromiseAll';
import { formObjectWithAttrValuesValidation } from '@/validation/objects';

import classes from './page.module.scss';

const cnObjects = classname(classes, 'editor-objects');

type PageProps = {
  params: { system_id: number };
};

const Page: React.FC<PageProps> = ({ params }) => {
  const queryClient = useQueryClient();

  const system_id = useMemo(() => Number(params.system_id) ?? -1, [params]);

  const [objectsWithAttrValuesQueryResult, attributeQueryResult] = useSuspenseQueries({
    queries: [
      {
        queryKey: [OBJECTS.GET, { system: system_id }],
        queryFn: () => getObjectsWithAttrValues(system_id),
      },
      {
        queryKey: [ATTRIBUTES.GET, { system: system_id }],
        queryFn: () => getAttributesWithValues(system_id),
        select: (data: TAttributeWithAttributeValues[]): TAttributeWithAttrValueForObjects[] =>
          data.map((attribute) => ({
            ...attribute,
            values: attribute.values.map((attrValue) => ({
              ...attrValue,
              isActive: false,
              added: false,
              deleted: false,
              idsId: -1,
            })),
          })),
      },
    ],
    combine: ([objectsQueryResult, attributeQueryResult]) => {
      const result: TObjectWithAttrValues[] = [];
      objectsQueryResult.data.forEach((object) => {
        const attrValMap = new Map(
          object.object_attribute_attributevalue_ids.map((ids) => [ids.attribute_value_id, ids.id]),
        );

        result.push({
          ...object,
          deleted: false,
          attributes: attributeQueryResult.data.map((attribute) => ({
            ...attribute,
            values: attribute.values.map((attrValues) => {
              const ids = attrValMap.get(attrValues.id);
              return {
                ...attrValues,
                isActive: !!ids,
                idsId: ids ?? -1,
              };
            }),
          })),
        });
      });
      return [
        { data: { formData: result }, isLoading: objectsQueryResult.isLoading || attributeQueryResult.isLoading },
        { data: attributeQueryResult.data, isLoading: attributeQueryResult.isLoading },
      ];
    },
  });

  const { attributesData, attributesIsLoading } = useMemo(
    () => ({ attributesData: attributeQueryResult.data, attributesIsLoading: attributeQueryResult.isLoading }),
    [attributeQueryResult],
  );
  const { objectsWithAttrValuesData, objectsWithAttrValuesIsLoading } = useMemo(
    () => ({
      objectsWithAttrValuesData: objectsWithAttrValuesQueryResult.data,
      objectsWithAttrValuesIsLoading: objectsWithAttrValuesQueryResult.isLoading,
    }),
    [objectsWithAttrValuesQueryResult],
  );

  const isLoading = useMemo(
    () => objectsWithAttrValuesIsLoading || attributesIsLoading,
    [attributesIsLoading, objectsWithAttrValuesIsLoading],
  );

  const {
    control,
    handleSubmit,
    getValues,
    formState: { dirtyFields, isValid },
  } = useForm<TObjectWithAttrValuesForm>({
    defaultValues: objectsWithAttrValuesData,
    resolver: zodResolver(formObjectWithAttrValuesValidation),
    mode: 'all',
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (responseList: TResponseObjectPageMutate) => objectPromiseAll(responseList),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [OBJECTS.GET, { system: system_id }] }),
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'formData', keyName: 'arrayId' });

  const isFormDirty = useCallback(() => {
    const currentValues = getValues('formData');
    const isDirtyForm = dirtyFields.formData?.some((object, objectIndex) => {
      if (object.id || object.name || object.system_id || currentValues[objectIndex].deleted) {
        return true;
      }

      return object.attributes?.some((attr) => attr.values?.some((attrValue) => attrValue.added || attrValue.deleted));
    });

    return isDirtyForm;
  }, [dirtyFields.formData, getValues]);

  const handleFormSubmit = useCallback(
    (form: TObjectWithAttrValuesForm) => {
      const objectNew: TObjectWithIdsNew[] = [];
      const objectUpdate: TObjectUpdate[] = [];
      const idsNew: TObjectAttributeAttributeValueNew[] = [];
      const objectDelete: number[] = [];
      const idsDelete: number[] = [];

      form.formData.forEach((object, objectIndex) => {
        if (object.deleted) {
          objectDelete.push(object.id);
          return;
        }
        const newIds: TObjectAttributeAttributeValueNew[] = [];

        object.attributes.forEach((attribue) =>
          attribue.values.forEach((attribueValue) => {
            if (attribueValue.added) {
              newIds.push({ object_id: object.id, attribute_id: attribue.id, attribute_value_id: attribueValue.id });
              return;
            }
            if (attribueValue.deleted) {
              idsDelete.push(attribueValue.idsId);
            }
          }),
        );
        if (object.id === -1) {
          objectNew.push({
            system_id: object.system_id,
            name: object.name,
            object_attribute_attributevalue_ids: newIds,
          });
        } else {
          idsNew.push(...newIds);
        }

        if (!dirtyFields.formData?.[objectIndex]?.id && dirtyFields.formData?.[objectIndex]?.name) {
          objectUpdate.push({ id: object.id, name: object.name });
        }
      });
      const responses: TResponseObjectPageMutate = {};

      if (objectNew.length) {
        responses.createObjectWithAttrValues = createObjectWithAttrValues(objectNew);
      }
      if (objectUpdate.length) {
        responses.updateObjects = updateObjects(objectUpdate);
      }
      if (idsNew.length) {
        responses.createObjectAttributeAttributeValue = createObjectAttributeAttributeValue(idsNew);
      }
      if (idsDelete.length) {
        responses.deleteObjectAttributeAttributeValue = deleteObjectAttributeAttributeValue(idsDelete);
      }
      if (objectDelete.length) {
        responses.deleteObjects = deleteObjects(objectDelete);
      }

      mutate(responses);
    },
    [dirtyFields.formData, mutate],
  );
  const handleAddObject = useCallback(
    () => append({ id: -1, system_id: system_id, name: '', attributes: attributesData, deleted: false }),
    [append, attributesData, system_id],
  );
  const handleDeleteObject = useCallback(
    (object: TObjectWithAttrValues, objectIndex: number) => () => {
      if (object.id === -1) {
        remove(objectIndex);
      } else {
        update(objectIndex, { ...object, deleted: true });
      }
    },
    [remove, update],
  );

  return (
    <main className={cnObjects()}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={cnObjects('form')}>
        <div className={cnObjects('objectsList')}>
          {fields.map((object, objectIndex) => (
            <ObjectField
              key={object.arrayId}
              isVisible={!object.deleted}
              objectId={object.id}
              control={control}
              objectIndex={objectIndex}
              onDelete={handleDeleteObject(object, objectIndex)}
            />
          ))}
          <div className={cnObjects('newObject')}>
            <AddIcon width={30} height={30} className={cnObjects('newObject-addIcon')} onClick={handleAddObject} />
            <Input className={cnObjects('newObject-input')} onClick={handleAddObject} placeholder="Новый обьект" />
          </div>
        </div>

        <div className={cnObjects('loadingScreen', { enabled: isLoading || isPending })} />
        <Button
          className={cnObjects('submitButton', { visible: isFormDirty() })}
          disabled={isLoading || isPending || !isValid}
          loading={isLoading || isPending}
        >
          Сохранить
        </Button>
      </form>
    </main>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false, loading: () => <Loader sizepx={116} /> });
