import { TAnswer } from './answers';
import { TQuestionWithAnswers } from './questions';

export type TResponseQuestionPageMutate = {
  createQuestionsWithAnswers?: Promise<TQuestionWithAnswers[]>;
  updateQuestions?: Promise<TQuestionWithAnswers[]>;
  createAnswers?: Promise<TAnswer[]>;
  updateAnswers?: Promise<TAnswer[]>;
  deleteQuestions?: Promise<number>;
  deleteAnswers?: Promise<number>;
};

export type TResponseAwaitedQuestionPageMutate = {
  createQuestionsWithAnswers?: TQuestionWithAnswers[];
  updateQuestions?: TQuestionWithAnswers[];
  createAnswers?: TAnswer[];
  updateAnswers?: TAnswer[];
  deleteQuestions?: number;
  deleteAnswers?: number;
};
