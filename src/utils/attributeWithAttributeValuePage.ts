import { DeepMap, DeepPartial } from 'react-hook-form';
import { UseMutateFunction } from '@tanstack/react-query';

import { createAttributesWithValues, deleteAttributes, updateAttributes } from '@/api/services/attributes';
import { createAttributesValues, deleteAttributesValues, updateAttributesValues } from '@/api/services/attributeValues';
import { TResponseAttributePageMutate, TResponseAwaitedAttributePageMutate } from '@/types/attributePage';
import {
  TAttributeUpdate,
  TAttributeWithAttributeValues,
  TAttributeWithAttributeValuesForm,
  TAttributeWithAttributeValuesNew,
} from '@/types/attributes';
import { TAttributeValue, TAttributeValueNew, TAttributeValueUpdate } from '@/types/attributeValues';

export const normilizeAttributeWithAttributevalue = (
  data: TAttributeWithAttributeValuesForm,
  responsesData: TResponseAwaitedAttributePageMutate,
): TAttributeWithAttributeValues[] => {
  const attributeWithAttributevalue: TAttributeWithAttributeValues[] = [];

  data.formData.forEach((attribute) => {
    if (attribute.deleted || attribute.id === -1) {
      return;
    }
    const newAttribute: TAttributeWithAttributeValues = attribute;
    const changedAttribute = responsesData.updateAttributes?.find(
      (changedattribute) => changedattribute.id === attribute.id,
    );
    if (changedAttribute) {
      newAttribute.name = changedAttribute.name;
    }

    const newAttributeValues: TAttributeValue[] = [];
    attribute.values.forEach((attributeValue) => {
      if (attributeValue.deleted || attributeValue.id === -1) {
        return;
      }
      const newAttributeValue = attributeValue;
      const changedAttributeValue = responsesData.updateAttributesValues?.find(
        (changedAttributeValue) => changedAttributeValue.id === attributeValue.id,
      );
      if (changedAttributeValue) {
        newAttributeValue.value = changedAttributeValue.value;
      }
      newAttributeValues.push(newAttributeValue);
    });

    newAttribute.values = newAttributeValues.concat(
      responsesData.createAttributesValues?.filter((answer) => answer.attribute_id === attribute.id) ?? [],
    );
    attributeWithAttributevalue.push(newAttribute);
  });

  attributeWithAttributevalue.push(...(responsesData.createAttributesWithValues ?? []));

  return attributeWithAttributevalue;
};

export const normilizeResponseDataAttributeWithAttributevalue = (
  data: TAttributeWithAttributeValues[],
): TAttributeWithAttributeValuesForm => ({
  formData: data.map((attribute) => ({
    ...attribute,
    deleted: false,
    values: attribute.values.map((values) => ({ ...values, deleted: false })),
  })),
});

export const handleFormSubmit =
  (
    dirtyFields: DeepMap<DeepPartial<TAttributeWithAttributeValuesForm>, boolean>,
    mutate: UseMutateFunction<TResponseAwaitedAttributePageMutate, Error, TResponseAttributePageMutate>,
  ) =>
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
  };
