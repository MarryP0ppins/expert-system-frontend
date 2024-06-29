import { TObjectAttributeAttributeValue } from './objectAttributeAttributeValue';
import { TObjectWithIds } from './objects';

export type TResponseObjectPageMutate = {
  createObjectWithAttrValues?: Promise<TObjectWithIds[]>;
  updateObjects?: Promise<TObjectWithIds[]>;
  createObjectAttributeAttributeValue?: Promise<TObjectAttributeAttributeValue[]>;
  deleteObjectAttributeAttributeValue?: Promise<number>;
  deleteObjects?: Promise<number>;
};

export type TResponseAwaitedObjectPageMutate = {
  createObjectWithAttrValues?: TObjectWithIds[];
  updateObjects?: TObjectWithIds[];
  createObjectAttributeAttributeValue?: TObjectAttributeAttributeValue[];
  deleteObjectAttributeAttributeValue?: number;
  deleteObjects?: number;
};
