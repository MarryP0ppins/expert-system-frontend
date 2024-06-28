import { z } from 'zod';

import {
  attributeUpdateValidation,
  attributeWithAttributeValuesForFormValidation,
  attributeWithAttributeValuesNewValidation,
  attributeWithAttributeValuesValidation,
  attributeWithAttrValueForObjectsValidation,
  formAttributeWithAttributeValuesValidation,
} from '@/validation/attributes';

export type TAttributeWithAttributeValues = z.infer<typeof attributeWithAttributeValuesValidation>;

export type TAttributeWithAttributeValuesNew = z.infer<typeof attributeWithAttributeValuesNewValidation>;

export type TAttributeUpdate = z.infer<typeof attributeUpdateValidation>;

export type TAttributeWithAttributeValuesForForm = z.infer<typeof attributeWithAttributeValuesForFormValidation>;

export type TAttributeWithAttributeValuesForm = z.infer<typeof formAttributeWithAttributeValuesValidation>;

export type TAttributeWithAttrValueForObjects = z.infer<typeof attributeWithAttrValueForObjectsValidation>;
