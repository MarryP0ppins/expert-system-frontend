import { z } from 'zod';

import {
  objectAttributeAttributeValueNewValidation,
  objectAttributeAttributeValueValidation,
} from '@/validation/objectAttributeAttributeValue';

export type TObjectAttributeAttributeValue = z.infer<typeof objectAttributeAttributeValueValidation>;

export type TObjectAttributeAttributeValueNew = z.infer<typeof objectAttributeAttributeValueNewValidation>;
