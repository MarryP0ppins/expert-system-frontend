import { z } from 'zod';

import {
  attributeValueForFormValidation,
  attributeValueNewValidation,
  attributeValueUpdateValidation,
  attributeValueValidation,
} from '@/validation/attributeValues';

export type TAttributeValue = z.infer<typeof attributeValueValidation>;

export type TAttributeValueUpdate = z.infer<typeof attributeValueUpdateValidation>;

export type TAttributeValueNew = z.infer<typeof attributeValueNewValidation>;

export type TAttributeValueForForm = z.infer<typeof attributeValueForFormValidation>;
