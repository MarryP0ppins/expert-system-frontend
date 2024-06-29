import { DeepMap, DeepPartial } from 'react-hook-form';
import { UseMutateFunction } from '@tanstack/react-query';

import {
  createObjectAttributeAttributeValue,
  deleteObjectAttributeAttributeValue,
} from '@/api/services/objectAttributeAttributeValue';
import { createObjectWithAttrValues, deleteObjects, updateObjects } from '@/api/services/objects';
import { TAttributeWithAttrValueForObjects } from '@/types/attributes';
import {
  TObjectAttributeAttributeValue,
  TObjectAttributeAttributeValueNew,
} from '@/types/objectAttributeAttributeValue';
import { TResponseAwaitedObjectPageMutate, TResponseObjectPageMutate } from '@/types/objectPage';
import {
  TObjectUpdate,
  TObjectWithAttrValues,
  TObjectWithAttrValuesForm,
  TObjectWithIds,
  TObjectWithIdsNew,
} from '@/types/objects';

export const normilizeObjects = (
  data: TObjectWithAttrValuesForm,
  responsesData: TResponseAwaitedObjectPageMutate,
): TObjectWithIds[] => {
  const objectsWithIds: TObjectWithIds[] = [];

  data.formData.forEach((object) => {
    if (object.deleted || object.id === -1) {
      return;
    }
    const objectIds: TObjectAttributeAttributeValue[] = [];
    object.attributes.forEach((attribute) =>
      attribute.values.forEach((attributeValue) => {
        if (attributeValue.isActive && !attributeValue.added) {
          objectIds.push({
            id: attributeValue.idsId,
            object_id: object.id,
            attribute_id: attribute.id,
            attribute_value_id: attributeValue.id,
          });
        }
      }),
    );
    objectIds.push(
      ...(responsesData.createObjectAttributeAttributeValue?.filter((ids) => ids.object_id === object.id) ?? []),
    );
    objectsWithIds.push({ ...object, object_attribute_attributevalue_ids: objectIds });
  });

  objectsWithIds.push(...(responsesData.createObjectWithAttrValues ?? []));

  return objectsWithIds;
};

export const normilizeResponseDataObjects = (
  objectsQueryResult: TObjectWithIds[],
  attributeQueryResult: TAttributeWithAttrValueForObjects[],
): TObjectWithAttrValuesForm => {
  const result: TObjectWithAttrValues[] = [];
  objectsQueryResult.forEach((object) => {
    const attrValMap = new Map(
      object.object_attribute_attributevalue_ids.map((ids) => [ids.attribute_value_id, ids.id]),
    );

    result.push({
      ...object,
      deleted: false,
      attributes: attributeQueryResult.map((attribute) => ({
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
  return { formData: result };
};

export const handleFormSubmit =
  (
    dirtyFields: DeepMap<DeepPartial<TObjectWithAttrValuesForm>, boolean>,
    mutate: UseMutateFunction<TResponseAwaitedObjectPageMutate, Error, TResponseObjectPageMutate>,
  ) =>
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
  };
