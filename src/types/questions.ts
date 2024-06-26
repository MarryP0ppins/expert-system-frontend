import { z } from 'zod';

import {
  formQuestionWithAnswerValidation,
  questionUpdateValidation,
  questionWithAnswerForFormValidation,
  questionWithAnswersNewValidation,
  questionWithAnswersValidation,
} from '@/validation/questions';

export type TQuestionWithAnswers = z.infer<typeof questionWithAnswersValidation>;

export type TQuestionWithAnswersNew = z.infer<typeof questionWithAnswersNewValidation>;

export type TQuestionUpdate = z.infer<typeof questionUpdateValidation>;

export type TQuestionWithAnswersForForm = z.infer<typeof questionWithAnswerForFormValidation>;

export type TQuestionWithAnswersForm = z.infer<typeof formQuestionWithAnswerValidation>;
