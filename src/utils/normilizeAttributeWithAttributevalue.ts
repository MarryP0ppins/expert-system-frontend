import { TAnswer } from '@/types/answers';
import { TResponseAwaitedAttributePageMutate } from '@/types/attributePage';
import { TAttributeValue } from '@/types/attributeValues';
import { TAttributeWithAttributeValues } from '@/types/attributes';

const normilizeAttributeWithAttributevalue = (
  data: TAttributeWithAttributeValues[],
  responsesData: TResponseAwaitedAttributePageMutate,
  toDelete: { attributes: number[]; attrValues: number[] },
): { formData: TAttributeWithAttributeValues[] } => {
  const attributeWithAttributevalue: TAttributeWithAttributeValues[] = [];

  data.forEach((attribute) => {
    if (toDelete.attributes.includes(attribute.id) || attribute.id === -1) {
      return;
    }
    const newAttribute = attribute;
    const changedAttribute = responsesData.updateAttributes?.find(
      (changedattribute) => changedattribute.id === attribute.id,
    );
    if (changedAttribute) {
      newAttribute.name = changedAttribute.name;
    }

    const newAttributeValues: TAttributeValue[] = [];
    attribute.values.forEach((attributeValue) => {
      if (toDelete.attrValues.includes(attributeValue.id) || attributeValue.id === -1) {
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

  return { formData: result };
};

export default normilizeAttributeWithAttributevalue;
