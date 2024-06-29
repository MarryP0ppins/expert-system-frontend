import { DeepMap, DeepPartial } from 'react-hook-form';
import { UseMutateFunction } from '@tanstack/react-query';

import { createAnswers, deleteAnswers, updateAnswers } from '@/api/services/answers';
import { createQuestionsWithAnswers, deleteQuestions, updateQuestions } from '@/api/services/questions';
import { TAnswer, TAnswerNew, TAnswerUpdate } from '@/types/answers';
import { TResponseAwaitedQuestionPageMutate, TResponseQuestionPageMutate } from '@/types/questionPage';
import {
  TQuestionUpdate,
  TQuestionWithAnswers,
  TQuestionWithAnswersForm,
  TQuestionWithAnswersNew,
} from '@/types/questions';

export const normilizeQuestionsWithAnswers = (
  data: TQuestionWithAnswersForm,
  responsesData: TResponseAwaitedQuestionPageMutate,
): TQuestionWithAnswers[] => {
  const questionsWithAnswers: TQuestionWithAnswers[] = [];

  data.formData.forEach((question) => {
    if (question.deleted || question.id === -1) {
      return;
    }
    const newQuestion: TQuestionWithAnswers = question;
    const changedQuestion = responsesData.updateQuestions?.find(
      (changedQuestion) => changedQuestion.id === question.id,
    );
    if (changedQuestion) {
      newQuestion.body = changedQuestion.body;
      newQuestion.with_chooses = changedQuestion.with_chooses;
    }
    if (!newQuestion.with_chooses) {
      newQuestion.answers = [];
      questionsWithAnswers.push(newQuestion);
      return;
    }

    const newAnswers: TAnswer[] = [];
    question.answers.forEach((answer) => {
      if (answer.deleted || answer.id === -1) {
        return;
      }
      const newAnswer = answer;
      const changedAnswer = responsesData.updateAnswers?.find((changedAnswer) => changedAnswer.id === answer.id);
      if (changedAnswer) {
        newAnswer.body = changedAnswer.body;
      }
      newAnswers.push(newAnswer);
    });

    newQuestion.answers = newAnswers.concat(
      responsesData.createAnswers?.filter((answer) => answer.question_id === question.id) ?? [],
    );
    questionsWithAnswers.push(newQuestion);
  });

  questionsWithAnswers.push(...(responsesData.createQuestionsWithAnswers ?? []));

  return questionsWithAnswers;
};

export const normilizeResponseDataQuestionWithAnswer = (data: TQuestionWithAnswers[]): TQuestionWithAnswersForm => ({
  formData: data.map((question) => ({
    ...question,
    deleted: false,
    answers: question.answers.map((answer) => ({ ...answer, deleted: false })),
  })),
});

export const handleFormSubmit =
  (
    dirtyFields: DeepMap<DeepPartial<TQuestionWithAnswersForm>, boolean>,
    mutate: UseMutateFunction<TResponseAwaitedQuestionPageMutate, Error, TResponseQuestionPageMutate>,
  ) =>
  (form: TQuestionWithAnswersForm) => {
    const questionsUpdate: TQuestionUpdate[] = [];
    const answersUpdate: TAnswerUpdate[] = [];
    const questionsNew: TQuestionWithAnswersNew[] = [];
    const answersNew: TAnswerNew[] = [];
    const questionsDelete: number[] = [];
    const answersDelete: number[] = [];
    console.log(form);
    form.formData.forEach((question, questionIndex) => {
      const newAnswersNewQuestions: string[] = [];

      if (question.deleted) {
        questionsDelete.push(question.id);
        return;
      }

      question.answers.forEach((answer, answerIndex) => {
        switch (true) {
          case !question.with_chooses:
            answersDelete.push(answer.id);
            return;
          case !answer.deleted:
            if (answer.id === -1) {
              if (answer.question_id === -1) {
                newAnswersNewQuestions.push(answer.body);
              } else {
                answersNew.push({ question_id: answer.question_id, body: answer.body });
              }
            }
            if (
              !dirtyFields.formData?.[questionIndex]?.answers?.[answerIndex]?.id &&
              dirtyFields.formData?.[questionIndex]?.answers?.[answerIndex]?.body
            ) {
              answersUpdate.push({ id: answer.id, body: answer.body });
            }
            return;
          default:
            answersDelete.push(answer.id);
            return;
        }
      });

      if (!question.deleted) {
        if (question.id === -1) {
          questionsNew.push({
            system_id: question.system_id,
            body: question.body,
            with_chooses: question.with_chooses,
            answers_body: newAnswersNewQuestions,
          });
        }
        if (
          !dirtyFields.formData?.[questionIndex]?.id &&
          (dirtyFields.formData?.[questionIndex]?.body || dirtyFields.formData?.[questionIndex]?.with_chooses)
        ) {
          questionsUpdate.push({ id: question.id, body: question.body, with_chooses: question.with_chooses });
        }
      }
    });

    const responses: TResponseQuestionPageMutate = {};
    if (questionsNew.length) {
      responses.createQuestionsWithAnswers = createQuestionsWithAnswers(questionsNew);
    }
    if (questionsUpdate.length) {
      responses.updateQuestions = updateQuestions(questionsUpdate);
    }
    if (answersNew.length) {
      responses.createAnswers = createAnswers(answersNew);
    }
    if (answersUpdate.length) {
      responses.updateAnswers = updateAnswers(answersUpdate);
    }
    if (questionsDelete.length) {
      responses.deleteQuestions = deleteQuestions(questionsDelete);
    }
    if (answersDelete.length) {
      responses.deleteAnswers = deleteAnswers(answersDelete);
    }

    mutate(responses);
  };
