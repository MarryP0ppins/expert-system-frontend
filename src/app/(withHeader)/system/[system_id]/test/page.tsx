'use client';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { createHistory } from '@/api/services/history';
import { getObjectsWithAttrValues } from '@/api/services/objects';
import { getSystemTest } from '@/api/services/systems';
import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import Input from '@/components/Input';
import Text, { TEXT_VIEW } from '@/components/Text';
import { HISTORIES, OBJECTS, SYSTEMS } from '@/constants';
import useUserStore from '@/store/userStore';
import { TAnswer } from '@/types/answers';
import { TRule } from '@/types/rules';
import { classname } from '@/utils';
import { clausesCheck } from '@/utils/clausesCheck';
import { systemIdValidation } from '@/validation/searchParams';

import classes from './page.module.scss';

const cnSystemCreatePage = classname(classes, 'systemTestPage');

type SystemTestPageProps = {
  params: { system_id: number };
};

const Page: React.FC<SystemTestPageProps> = ({ params }) => {
  const user = useUserStore((store) => store.user);
  const system_id = useMemo(() => systemIdValidation.safeParse(params).data?.system_id ?? -1, [params]);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [currentOption, setCurrentOption] = useState<TAnswer | undefined>();
  const [rules, setRules] = useState<TRule[]>([]);
  const [checkedAttrValues, setCheckedAttrValues] = useState<Set<number>>(new Set());
  const [answers, setAnswers] = useState<Map<number, TAnswer>>(new Map());
  const [testResults, setTestResults] = useState<{ key: string; value: number }[]>([]);

  const { data: systemTestData } = useSuspenseQuery({
    queryKey: [SYSTEMS.TEST, { system_id: system_id }],
    queryFn: async () => await getSystemTest(system_id),
  });

  useEffect(() => setRules(systemTestData.rules), [systemTestData.rules]);

  const { data: objectsData } = useSuspenseQuery({
    queryKey: [OBJECTS.GET, { system_id: system_id }],
    queryFn: async () => await getObjectsWithAttrValues(system_id),
  });

  const { mutate } = useMutation({ mutationFn: createHistory, mutationKey: [HISTORIES.RETRIEVE, { user: user?.id }] });

  useEffect(() => {
    const result: { key: string; value: number }[] = [];
    let totalScore = 0;
    objectsData.forEach((object) => {
      let objScore = 0;
      object.object_attribute_attributevalue_ids.forEach((ids) => {
        if (checkedAttrValues.has(ids.attribute_value_id)) {
          objScore++;
        }
      });
      totalScore += objScore;
      result.push({ key: object.name, value: objScore });
    });

    setTestResults(result.map((res) => ({ key: res.key, value: res.value ? (res.value / totalScore) * 100 : 0 })));
  }, [checkedAttrValues, objectsData]);

  const currentQuestion = useMemo(
    () => systemTestData.questions[currentQuestionNumber],
    [currentQuestionNumber, systemTestData.questions],
  );

  // const handleNextQuestion = useCallback(() => setCurrentQuestionNumber((prev) => prev + 1), []);

  const handleFinishClick = useCallback(() => {
    setCurrentQuestionNumber(systemTestData.questions.length);
  }, [systemTestData.questions.length]);

  const handleOptionClick = useCallback(
    (option: TAnswer) => () => {
      setCurrentOption(option);
    },
    [],
  );

  const handleInputChange = useCallback(
    (question_id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentOption({ id: -1, question_id, body: event.currentTarget.value });
    },
    [],
  );

  const handleAccept = useCallback(
    (currentOption?: TAnswer) => () => {
      if (currentOption) {
        setAnswers((prev) => new Map(prev).set(currentOption.question_id, currentOption));
        setCurrentQuestionNumber((prev) => prev + 1);
        setCurrentOption(undefined);

        const allAnswers = Array.from(answers, ([, answer]) => answer);

        const matchedRules = clausesCheck({ collectedAnswers: allAnswers.concat(currentOption), rules: rules });

        if (matchedRules.length) {
          const matchedRulesIds = matchedRules.map((rule) => rule.id);
          setRules((prev) => prev.filter((rule) => !matchedRulesIds.includes(rule.id)));
          matchedRules.forEach((rule) => {
            if (rule.attribute_rule) {
              const ids = rule.rule_attribute_attributevalue_ids.map((ids) => ids.attribute_value_id);
              setCheckedAttrValues((prev) => new Set([...ids, ...prev]));
            } else {
              rule.rule_question_answer_ids.forEach((ids) => {
                const question = systemTestData.questions.find((question) => question.id === ids.question_id);
                const answer = question?.answers.find((answer) => answer.id === ids.answer_id);
                if (!!question && !!answer) {
                  setAnswers((prev) => new Map(prev).set(question.id, answer));
                }
              });
            }
          });
        }
      }
    },
    [answers, rules, systemTestData.questions],
  );

  const testIsEnd = useMemo(
    () => currentQuestionNumber >= systemTestData.questions.length,
    [currentQuestionNumber, systemTestData.questions.length],
  );

  useEffect(() => {
    const answer = answers.get(currentQuestion?.id);
    if (answer) {
      handleAccept(answer)();
    }
  }, [answers, currentQuestion?.id, handleAccept]);

  const handleHistoryCreate = useCallback(() => {
    const res = testResults.reduce(
      (pre, type) => ({
        ...pre,
        [type.key]: type.value,
      }),
      {} as { [key: string]: number },
    );
    mutate({
      user_id: user?.id ?? -1,
      system_id,
      results: res,
      answered_questions: `${systemTestData.questions.length - 2}/${systemTestData.questions.length}`,
    });
  }, [mutate, systemTestData.questions.length, system_id, testResults, user?.id]);
  return (
    <div className={cnSystemCreatePage()}>
      <header className={cnSystemCreatePage('header')}>
        <Text view={TEXT_VIEW.title} className={cnSystemCreatePage('title')}>
          Прохождение системы
        </Text>
        {systemTestData.questions.length ? (
          <Text view={TEXT_VIEW.p20} className={cnSystemCreatePage('subtitle', { testIsEnd })}>
            {`Вопрос ${currentQuestionNumber + 1} из ${systemTestData.questions.length}`}
          </Text>
        ) : (
          <Text view={TEXT_VIEW.p20} className={cnSystemCreatePage('subtitle', { nothing: true })}>
            Вопросов нет
          </Text>
        )}
      </header>

      {!!systemTestData.questions.length && (
        <>
          <main className={cnSystemCreatePage('main', { testIsEnd })}>
            {!testIsEnd && (
              <div className={cnSystemCreatePage('answersField')}>
                <Text view={TEXT_VIEW.p20} className={cnSystemCreatePage('questionTitle')}>
                  {currentQuestion?.body}
                </Text>
                <div className={cnSystemCreatePage('options')}>
                  {currentQuestion?.with_chooses ? (
                    currentQuestion.answers.map((answer) => (
                      <div key={answer.id} className={cnSystemCreatePage('option')} onClick={handleOptionClick(answer)}>
                        <CheckBox value={answer.body} checked={currentOption?.id === answer.id} />
                        <Text>{answer.body}</Text>
                      </div>
                    ))
                  ) : (
                    <Input type="number" placeholder="Введите ответ" onChange={handleInputChange(currentQuestion.id)} />
                  )}
                </div>
              </div>
            )}
            <div className={cnSystemCreatePage('results')}>
              <Text view={TEXT_VIEW.p18}>{testIsEnd ? 'Результаты тестирования' : 'Предварительные результаты'}</Text>
              {!!testResults.length &&
                testResults.map((result) => (
                  <Text
                    key={result.key}
                  >{`${result.key.length > 18 ? `${result.key.slice(0, 16)}...` : result.key}: ${result.value.toFixed(2)}%`}</Text>
                ))}
              {!testResults.length && testIsEnd && (
                <Text className={cnSystemCreatePage('error')}>Недостаточно данных для предоставления результатов!</Text>
              )}
            </div>
          </main>
          <div className={cnSystemCreatePage('buttons')}>
            {testIsEnd ? (
              <Link href="/">
                <Button onClick={handleHistoryCreate}>Завершить тестирование</Button>
              </Link>
            ) : (
              <>
                <Button className={cnSystemCreatePage('button-abort')} onClick={handleFinishClick}>
                  Завершить тестирование
                </Button>
                {/* <Button onClick={handleNextQuestion} className={cnSystemCreatePage('button-pass')}>
              Пропустить вопрос
            </Button> */}
                <Button
                  onClick={handleAccept(currentOption)}
                  disabled={!currentOption}
                  className={cnSystemCreatePage('button-accept', { disabled: !currentOption })}
                >
                  Далее
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(Page);