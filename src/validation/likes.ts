import { z } from 'zod';

export const likeValidation = z.object({
  id: z.number(),
  user_id: z.number(),
  system_id: z.number(),
});

export const likeNewValidation = likeValidation.omit({ id: true });
