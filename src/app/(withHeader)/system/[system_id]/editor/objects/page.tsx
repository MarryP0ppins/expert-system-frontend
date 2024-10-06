'use client';
import React, { use, useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useSuspenseQueries } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getAttributesWithValues } from '@/api/services/attributes';
import { getObjectsWithAttrValues } from '@/api/services/objects';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import ObjectField from '@/components/ObjectField';
import { ATTRIBUTES, OBJECTS } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import { TAttributeWithAttributeValues, TAttributeWithAttrValueForObjects } from '@/types/attributes';
import { TResponseObjectPageMutate } from '@/types/objectPage';
import { TObjectWithAttrValues, TObjectWithAttrValuesForm, TObjectWithIds } from '@/types/objects';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';
import { objectPromiseAll } from '@/utils/objectPromiseAll';
import { handleFormSubmit, normilizeObjects, normilizeResponseDataObjects } from '@/utils/objectsPage';
import { formObjectWithAttrValuesValidation } from '@/validation/objects';
import { systemIdValidation } from '@/validation/searchParams';

import classes from './page.module.scss';

const cnObjects = classname(classes, 'editor-objects');

type PageProps = {
  params: Promise<{ system_id: string }>;
};

const Page: React.FC<PageProps> = ({ params }) => {
  const systemIdParam = use(params).system_id;
  const system_id = systemIdValidation.safeParse(systemIdParam).data;

  if (!system_id) {
    notFound();
  }

  const queryClient = getQueryClient();

  const [objectsWithAttrValuesQueryResult, attributeQueryResult] = useSuspenseQueries({
    queries: [
      {
        queryKey: [OBJECTS.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system: number }>) => getObjectsWithAttrValues(params.queryKey[1].system),
      },
      {
        queryKey: [ATTRIBUTES.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system: number }>) => getAttributesWithValues(params.queryKey[1].system),
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
    combine: ([objectsQueryResult, attributeQueryResult]) => [
      {
        data: normilizeResponseDataObjects(objectsQueryResult.data, attributeQueryResult.data),
        isLoading: objectsQueryResult.isLoading || attributeQueryResult.isLoading,
      },
      { data: attributeQueryResult.data, isLoading: attributeQueryResult.isLoading },
    ],
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
    reset,
    formState: { dirtyFields, isValid },
  } = useForm<TObjectWithAttrValuesForm>({
    defaultValues: objectsWithAttrValuesData,
    resolver: zodResolver(formObjectWithAttrValuesValidation),
    mode: 'all',
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (responseList: TResponseObjectPageMutate) => objectPromiseAll(responseList),
    onSuccess: (data) => {
      const newData = normilizeObjects(getValues(), data);
      reset(normilizeResponseDataObjects(newData, attributesData));
      queryClient.setQueryData<TObjectWithIds[]>([OBJECTS.GET, { system: system_id }], newData);
    },
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
      <form onSubmit={handleSubmit(handleFormSubmit(dirtyFields, mutate))} className={cnObjects('form')}>
        <div className={cnObjects('objectsList')}>
          {fields.map((object, objectIndex) => (
            <ObjectField
              key={object.arrayId}
              isVisible={!object.deleted}
              objectId={object.id}
              control={control}
              objectIndex={objectIndex}
              attributes={object.attributes}
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
