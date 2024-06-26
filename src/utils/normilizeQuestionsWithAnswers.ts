import { TAnswer } from '@/types/answers';
import { TResponseAwaitedQuestionPageMutate } from '@/types/questionPage';
import { TQuestionWithAnswers, TQuestionWithAnswersForm } from '@/types/questions';

export const normilizeQuestionsWithAnswers = (
  data: TQuestionWithAnswersForm,
  responsesData: TResponseAwaitedQuestionPageMutate,
  toDelete: { questions: number[]; answers: number[] },
): TQuestionWithAnswers[] => {
  const questionsWithAnswers: TQuestionWithAnswers[] = [];

  data.formData.forEach((question) => {
    if (toDelete.questions.includes(question.id) || question.id === -1) {
      return;
    }
    const newQuestion = question;
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
      if (toDelete.answers.includes(answer.id) || answer.id === -1) {
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

  const result = questionsWithAnswers.concat(responsesData.createQuestionsWithAnswers ?? []);

  return result;
};

export default normilizeQuestionsWithAnswers;
