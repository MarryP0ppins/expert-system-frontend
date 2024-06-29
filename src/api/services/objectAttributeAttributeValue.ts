import {
  TObjectAttributeAttributeValue,
  TObjectAttributeAttributeValueNew,
} from '@/types/objectAttributeAttributeValue';

import { deleteApiRequest, postApiRequest } from '..';

export const createObjectAttributeAttributeValue = async (
  ids: TObjectAttributeAttributeValueNew[],
): Promise<TObjectAttributeAttributeValue[]> => {
  const { data } = await postApiRequest<TObjectAttributeAttributeValue[], TObjectAttributeAttributeValueNew[]>(
    `/object-attribute-attributevalue`,
    ids,
  );

  return data;
};

export const deleteObjectAttributeAttributeValue = async (idsIds: number[]): Promise<number> => {
  const result = await deleteApiRequest<number, number[]>(`/object-attribute-attributevalue/multiple_delete`, idsIds);

  return result;
};
