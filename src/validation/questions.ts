import { z } from 'zod';

import { answerForFormValidation, answerValidation } from './answers';

export const questionValidation = z.object({
  id: z.number(),
  system_id: z.number(),
  body: z.string().min(1, 'Поле не может быть пустым').max(128, 'Максимальная длина - 128'),
  with_chooses: z.boolean(),
});

export const questionWithAnswersValidation = questionValidation.extend({
  answers: z.array(answerValidation),
});

export const questionWithAnswersNewValidation = questionValidation.omit({ id: true }).extend({
  answers_body: z.array(z.string().min(1, 'Поле не может быть пустым').max(128, 'Максимальная длина - 128')),
});

export const questionUpdateValidation = questionValidation.omit({ system_id: true });

export const questionWithAnswerForFormValidation = questionValidation
  .extend({ deleted: z.boolean(), answers: z.array(answerForFormValidation) })
  .refine((question) =>
    !question.deleted && question.with_chooses ? question.answers.some((answer) => !answer.deleted) : true,
  );

export const formQuestionWithAnswerValidation = z.object({
  formData: z.array(questionWithAnswerForFormValidation),
});
