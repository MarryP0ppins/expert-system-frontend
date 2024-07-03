'use client';
import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import { TQueryKey } from '@/api';
import { getQuestionsWithAnswers } from '@/api/services/questions';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import QuestionField from '@/components/QuestionField';
import { QUESTIONS } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import { TResponseQuestionPageMutate } from '@/types/questionPage';
import { TQuestionWithAnswers, TQuestionWithAnswersForForm, TQuestionWithAnswersForm } from '@/types/questions';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';
import { objectPromiseAll } from '@/utils/objectPromiseAll';
import {
  handleFormSubmit,
  normilizeQuestionsWithAnswers,
  normilizeResponseDataQuestionWithAnswer,
} from '@/utils/questionWithAnswerPage';
import { formQuestionWithAnswerValidation } from '@/validation/questions';

import classes from './page.module.scss';

const cnQuestions = classname(classes, 'editor-questions');

type PageProps = {
  params: { system_id: number };
};

const Page: React.FC<PageProps> = ({ params }) => {
  const queryClient = getQueryClient();

  const system_id = useMemo(() => Number(params.system_id) ?? -1, [params]);

  const { data, isLoading } = useSuspenseQuery({
    queryKey: [QUESTIONS.GET, { system: system_id }],
    queryFn: (params: TQueryKey<{ system: number }>) => getQuestionsWithAnswers(params.queryKey[1].system),
    select: (data) => normilizeResponseDataQuestionWithAnswer(data),
  });

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { dirtyFields, isValid },
  } = useForm<TQuestionWithAnswersForm>({
    defaultValues: data,
    resolver: zodResolver(formQuestionWithAnswerValidation),
    mode: 'all',
  });
  const { mutate, isPending } = useMutation({
    mutationFn: (responseList: TResponseQuestionPageMutate) => objectPromiseAll(responseList),
    onSuccess: (data) => {
      const newData = normilizeQuestionsWithAnswers(getValues(), data);
      reset(normilizeResponseDataQuestionWithAnswer(newData));
      queryClient.setQueryData<TQuestionWithAnswers[]>([QUESTIONS.GET, { system: system_id }], newData);
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'formData', keyName: 'arrayId' });

  const isFormDirty = useCallback(() => {
    const currentValues = getValues('formData');
    const isDirtyForm = dirtyFields.formData?.some((question, questionIndex) => {
      const currentQuestion = currentValues[questionIndex];
      if (question.id || question.body || question.system_id || question.with_chooses || currentQuestion.deleted) {
        return true;
      }
      return question.answers?.some(
        (answer, answerIndex) =>
          Object.values(answer).some((val) => val) || currentQuestion.answers[answerIndex].deleted,
      );
    });
    return isDirtyForm;
  }, [dirtyFields.formData, getValues]);

  const handleAddQuestion = useCallback(
    () => append({ id: -1, system_id: system_id, body: '', with_chooses: true, answers: [], deleted: false }),
    [append, system_id],
  );

  const handleDeleteQuestion = useCallback(
    (question: TQuestionWithAnswersForForm, questionIndex: number) => () => {
      if (question.id === -1) {
        remove(questionIndex);
      } else {
        update(questionIndex, { ...question, deleted: true });
      }
    },
    [remove, update],
  );

  return (
    <main className={cnQuestions()}>
      <form onSubmit={handleSubmit(handleFormSubmit(dirtyFields, mutate))} className={cnQuestions('form')}>
        {fields.map((question, questionIndex) => (
          <QuestionField
            key={question.arrayId}
            isVisible={!question.deleted}
            questionId={question.id}
            control={control}
            questionIndex={questionIndex}
            onDelete={handleDeleteQuestion(question, questionIndex)}
          />
        ))}
        <div className={cnQuestions('newQuestion')}>
          <AddIcon width={30} height={30} className={cnQuestions('newQuestion-addIcon')} onClick={handleAddQuestion} />
          <Input className={cnQuestions('newQuestion-input')} onClick={handleAddQuestion} placeholder="Новый вопрос" />
        </div>
        <div className={cnQuestions('loadingScreen', { enabled: isLoading || isPending })} />
        <Button
          className={cnQuestions('submitButton', { visible: isFormDirty() })}
          disabled={isLoading || isPending || !isValid}
          loading={isLoading || isPending}
        >
          Сохранить
        </Button>
      </form>
    </main>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false, loading: () => <Loader sizepx={116} /> });
