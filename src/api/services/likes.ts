import { TLike, TLikeNew } from '@/types/likes';

import { deleteApiRequest, getApiRequest, postApiRequest } from '..';

export const createLike = async (like: TLikeNew): Promise<TLike> => {
  const { data } = await postApiRequest<TLike, TLikeNew>(`/likes`, like);

  return data;
};

export const getLikes = async (userId: number): Promise<TLike[]> => {
  const { data } = await getApiRequest<TLike[]>(`/likes`, { params: { user_id: userId } });

  return data;
};

export const deleteLike = async (id: number): Promise<number> => {
  const result = await deleteApiRequest<number>(`/likes/${id}`);

  return result;
};
