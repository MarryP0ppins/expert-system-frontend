import { TResponseAwaitedAttributePageMutate } from '@/types/attributePage';
import { TAttributeWithAttributeValues, TAttributeWithAttributeValuesForm } from '@/types/attributes';
import { TAttributeValue } from '@/types/attributeValues';

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

  const result = attributeWithAttributevalue.concat(responsesData.createAttributesWithValues ?? []);

  return result;
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
