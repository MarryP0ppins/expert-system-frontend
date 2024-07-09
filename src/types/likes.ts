import { z } from 'zod';

import { likeNewValidation, likeValidation } from '@/validation/likes';

export type TLike = z.infer<typeof likeValidation>;

export type TLikeNew = z.infer<typeof likeNewValidation>;
