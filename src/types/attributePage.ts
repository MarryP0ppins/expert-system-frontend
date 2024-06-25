import { TAttributeWithAttributeValues } from './attributes';
import { TAttributeValue } from './attributeValues';

export type TResponseAttributePageMutate = {
  createAttributesWithValues?: Promise<TAttributeWithAttributeValues[]>;
  updateAttributes?: Promise<TAttributeWithAttributeValues[]>;
  createAttributesValues?: Promise<TAttributeValue[]>;
  updateAttributesValues?: Promise<TAttributeValue[]>;
  deleteAttributes?: Promise<number>;
  deleteAttributesValues?: Promise<number>;
};

export type TResponseAwaitedAttributePageMutate = {
  createAttributesWithValues?: TAttributeWithAttributeValues[];
  updateAttributes?: TAttributeWithAttributeValues[];
  createAttributesValues?: TAttributeValue[];
  updateAttributesValues?: TAttributeValue[];
  deleteAttributes?: number;
  deleteAttributesValues?: number;
};
