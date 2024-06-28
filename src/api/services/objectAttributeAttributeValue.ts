import { TObjectAttributeAttributeValueNew } from '@/types/objectAttributeAttributeValue';

import { deleteApiRequest, postApiRequest } from '..';

export const createObjectAttributeAttributeValue = async (ids: TObjectAttributeAttributeValueNew[]): Promise<null> => {
  const { data } = await postApiRequest<null, TObjectAttributeAttributeValueNew[]>(
    `/object-attribute-attributevalue`,
    ids,
  );

  return data;
};

export const deleteObjectAttributeAttributeValue = async (idsIds: number[]): Promise<number> => {
  const result = await deleteApiRequest<number, number[]>(`/object-attribute-attributevalue/multiple_delete`, idsIds);

  return result;
};
