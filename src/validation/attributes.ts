import { number, z } from 'zod';

import { attributeValueForFormValidation, attributeValueValidation } from './attributeValues';

export const attributeValidation = z.object({
  id: z.number(),
  system_id: number().positive(),
  name: z.string().min(1, 'Поле не может быть пустым').max(64, 'Максимальная длина - 64'),
});

export const attributeWithAttributeValuesValidation = attributeValidation.extend({
  values: z.array(attributeValueValidation),
});

export const attributeWithAttributeValuesNewValidation = attributeValidation.omit({ id: true }).extend({
  values_name: z.array(z.string().min(1, 'Поле не может быть пустым').max(64, 'Максимальная длина - 64')),
});

export const formAttrWithValuesValidation = z.object({ formData: z.array(attributeWithAttributeValuesValidation) });

export const attributeUpdateValidation = attributeValidation.omit({ system_id: true });

export const attributeWithAttributeValuesForFormValidation = attributeValidation
  .extend({
    deleted: z.boolean(),
    values: z.array(attributeValueForFormValidation),
  })
  .refine((attribute) => (!attribute.deleted ? attribute.values.some((attrValues) => !attrValues.deleted) : true));

export const formAttributeWithAttributeValuesValidation = z.object({
  formData: z.array(attributeWithAttributeValuesForFormValidation),
});
