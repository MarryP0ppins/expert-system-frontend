import { TObjectWithIds } from './objects';

export type TResponseObjectPageMutate = {
  createObjectWithAttrValues?: Promise<TObjectWithIds[]>;
  updateObjects?: Promise<TObjectWithIds[]>;
  createObjectAttributeAttributeValue?: Promise<null>;
  deleteObjectAttributeAttributeValue?: Promise<number>;
  deleteObjects?: Promise<number>;
};

export type TResponseAwaitedObjectPageMutate = {
  createObjectWithAttrValues?: TObjectWithIds[];
  updateObjects?: TObjectWithIds[];
  createObjectAttributeAttributeValue?: null;
  deleteObjectAttributeAttributeValue?: number;
  deleteObjects?: number;
};
