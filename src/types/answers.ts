import { z } from 'zod';

import {
  answerForFormValidation,
  answerNewValidation,
  answerUpdateValidation,
  answerValidation,
} from '@/validation/answers';

export type TAnswer = z.infer<typeof answerValidation>;

export type TAnswerUpdate = z.infer<typeof answerUpdateValidation>;

export type TAnswerNew = z.infer<typeof answerNewValidation>;

export type TAnswerForForm = z.infer<typeof answerForFormValidation>;
