'use client';
import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useSuspenseQueries } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

import { TQueryKey } from '@/api';
import { getAttributesWithValues } from '@/api/services/attributes';
import { createClauses, deleteClauses, updateClauses } from '@/api/services/clauses';
import { getQuestionsWithAnswers } from '@/api/services/questions';
import {
  createRuleAttributeAttributeValue,
  deleteRuleAttributeAttributeValue,
} from '@/api/services/ruleAttributeAttributeValue';
import { createRuleQuestionAnswer, deleteRuleQuestionAnswer } from '@/api/services/ruleQuestionAnswer';
import { createRulesWithClausesAndEffects, deleteRules, getRulesWithClausesAndEffects } from '@/api/services/rules';
import Button from '@/components/Button';
import Dropdown, { Option } from '@/components/Dropdown';
import Loader from '@/components/Loader';
import RuleField from '@/components/RuleField';
import Text from '@/components/Text';
import { ATTRIBUTES, OPERATOR, QUESTIONS, RULES } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import useRulePageStore from '@/store/rulePageStore';
import { TClauseForForm, TClauseNew, TClauseUpdate } from '@/types/clauses';
import { TRuleAttributeAttributeValueNew } from '@/types/ruleAttributeAttributeValue';
import { TRuleQuestionAnswerNew } from '@/types/ruleQuestionAnswer';
import { TRuleForForm, TRuleForm, TRuleNew } from '@/types/rules';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';
import { formRuleValidation } from '@/validation/rules';
import { systemIdValidation } from '@/validation/searchParams';

import classes from './page.module.scss';

const cnRules = classname(classes, 'editor-rules');

type PageProps = {
  params: Promise<{ system_id: string }>;
};

const allQuestionSelect: Option = {
  value: -1,
  label: 'все вопросы',
};

const Page: React.FC<PageProps> = ({ params }) => {
  const systemIdParam = use(params).system_id;
  const system_id = systemIdValidation.safeParse(systemIdParam).data;

  if (!system_id) {
    notFound();
  }

  const queryClient = getQueryClient();
  const { setAttributes, setQuestions } = useRulePageStore((store) => store);
  const [selectQuestion, setSelectQuestion] = useState<Option>(allQuestionSelect);

  const [attributeQueryResult, questionsQueryResult, rulesQueryResult] = useSuspenseQueries({
    queries: [
      {
        queryKey: [ATTRIBUTES.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system: number }>) => getAttributesWithValues(params.queryKey[1].system),
      },
      {
        queryKey: [QUESTIONS.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system: number }>) => getQuestionsWithAnswers(params.queryKey[1].system),
      },
      {
        queryKey: [RULES.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system: number }>) => getRulesWithClausesAndEffects(params.queryKey[1].system),
      },
    ],
  });

  useEffect(() => {
    if (attributeQueryResult.isSuccess) {
      setAttributes(attributeQueryResult.data);
    }
    if (questionsQueryResult.isSuccess) {
      setQuestions(questionsQueryResult.data);
    }
  }, [
    attributeQueryResult.data,
    attributeQueryResult.isSuccess,
    questionsQueryResult.data,
    questionsQueryResult.isSuccess,
    setAttributes,
    setQuestions,
  ]);

  const questionsOptions = useMemo<Option[]>(
    () =>
      [allQuestionSelect].concat(
        questionsQueryResult.data.map((question) => ({ label: question.body, value: question.id })),
      ),
    [questionsQueryResult.data],
  );

  const handleQuestionSelect = useCallback((option: Option) => setSelectQuestion(option), []);

  const filtredRules = useMemo(
    () =>
      selectQuestion?.value === -1
        ? rulesQueryResult.data
        : rulesQueryResult.data.filter((rule) =>
            rule.clauses.some((clause) => clause.question_id === selectQuestion?.value),
          ),
    [rulesQueryResult.data, selectQuestion],
  );

  const isLoading = useMemo(
    () => attributeQueryResult.isLoading || questionsQueryResult.isLoading || rulesQueryResult.isLoading,
    [attributeQueryResult.isLoading, questionsQueryResult.isLoading, rulesQueryResult.isLoading],
  );

  const pageData = useMemo<TRuleForm>(() => {
    const res: TRuleForm = { formData: [] };
    filtredRules?.forEach((rule) => {
      const newRule: TRuleForForm = {
        ...rule,
        deleted: false,
        clauses: [],
        rule_question_answer_ids: rule.rule_question_answer_ids.map((ids) => ({ ...ids, deleted: false })),
        rule_attribute_attributevalue_ids: rule.rule_attribute_attributevalue_ids.map((ids) => ({
          ...ids,
          deleted: false,
        })),
      };
      const clausesMap: Map<string, TClauseForForm[]> = new Map();
      rule.clauses.forEach((clause) => {
        const logicGroup = clausesMap.get(clause.logical_group);
        if (logicGroup) {
          clausesMap.set(clause.logical_group, logicGroup.concat({ ...clause, deleted: false }));
        } else {
          clausesMap.set(clause.logical_group, [{ ...clause, deleted: false }]);
        }
      });
      newRule.clauses = Array.from(clausesMap, ([, clausesArray]) => clausesArray);
      res.formData.push(newRule);
    });
    return res;
  }, [filtredRules]);

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { dirtyFields, isValid },
  } = useForm<TRuleForm>({
    resolver: zodResolver(formRuleValidation),
    mode: 'all',
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (responseList: Promise<unknown>[]) => Promise.allSettled(responseList),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [RULES.GET, { system: system_id }] }),
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'formData', keyName: 'arrayId' });

  const isFormDirty = useCallback(() => {
    const currentValues = getValues();
    return dirtyFields.formData?.some((rule, ruleIndex) => {
      const currentRule = currentValues.formData[ruleIndex];
      if (rule.id || rule.system_id || rule.attribute_rule || currentRule.deleted) {
        return true;
      }
      return (
        rule.clauses?.some((clauseGroup, clauseGroupIndex) => {
          const currentClauseGroup = currentRule.clauses[clauseGroupIndex];
          return clauseGroup.some(
            (val, valIndex) => Object.values(val).some((val) => val) || currentClauseGroup[valIndex].deleted,
          );
        }) ||
        rule.rule_question_answer_ids?.some(
          (clause, clauseIndex) =>
            Object.values(clause).some((val) => val) || currentRule.rule_question_answer_ids[clauseIndex].deleted,
        ) ||
        rule.rule_attribute_attributevalue_ids?.some(
          (clause, clauseIndex) =>
            Object.values(clause).some((val) => val) ||
            currentRule.rule_attribute_attributevalue_ids[clauseIndex].deleted,
        )
      );
    });
  }, [dirtyFields.formData, getValues]);

  const handleFormSubmit = useCallback(
    (form: TRuleForm) => {
      const newRules: TRuleNew[] = [];
      const deleteRulesList: number[] = [];
      const newClausesList: TClauseNew[] = [];
      const updateClausesList: TClauseUpdate[] = [];
      const deleteClausesList: number[] = [];
      const newRuleQuestionAnsweIds: TRuleQuestionAnswerNew[] = [];
      const deleteRuleQuestionAnsweIds: number[] = [];
      const newRuleAttributeAttributeValueIds: TRuleAttributeAttributeValueNew[] = [];
      const deleteRuleAttributeAttributeValueIds: number[] = [];

      form.formData.forEach((rule, ruleIndex) => {
        if (rule.deleted) {
          deleteRulesList.push(rule.id);
        } else {
          const newRule: TRuleNew = {
            system_id: rule.system_id,
            attribute_rule: rule.attribute_rule,
            clauses: [],
            rule_question_answer_ids: [],
            rule_attribute_attributevalue_ids: [],
          };
          //-----------------CLAUSES------------------

          rule.clauses.forEach((clauseGroup, clauseGroupIndex) =>
            clauseGroup.forEach((clause, clauseIndex) => {
              if (clause.rule_id === -1) {
                newRule.clauses.push(clause);
                return;
              }
              if (clause.id === -1) {
                newClausesList.push(clause);
                return;
              }
              if (clause.deleted) {
                deleteClausesList.push(clause.id);
                return;
              }
              const dirtyFieldClause = dirtyFields.formData?.[ruleIndex]?.clauses?.[clauseGroupIndex]?.[clauseIndex];
              if (
                !dirtyFieldClause?.id &&
                (dirtyFieldClause?.compared_value || dirtyFieldClause?.operator || dirtyFieldClause?.question_id)
              ) {
                updateClausesList.push(clause);
              }
            }),
          );

          //-----------------QUESTIONS------------------
          const oldRule = pageData.formData.find((oldRule) => oldRule.id === rule.id);

          const newQuestions = rule.rule_question_answer_ids.filter(
            (x) => !oldRule?.rule_question_answer_ids.some((y) => x.id === y.id),
          );
          if (rule.id === -1) {
            newRule.rule_question_answer_ids = newQuestions;
          } else {
            newRuleQuestionAnsweIds.push(...newQuestions);
          }
          const deleteQuestions =
            rule?.rule_question_answer_ids.filter((x) => x.deleted)?.map((question) => question.id) ?? [];
          deleteRuleQuestionAnsweIds.push(...deleteQuestions);

          //-----------------ATTRIBUTE------------------
          const newAttributes = rule.rule_attribute_attributevalue_ids.filter(
            (x) => !oldRule?.rule_attribute_attributevalue_ids.some((y) => x.id === y.id),
          );
          if (rule.id === -1) {
            newRule.rule_attribute_attributevalue_ids = newAttributes;
          } else {
            newRuleAttributeAttributeValueIds.push(...newAttributes);
          }
          const deleteAttributes =
            rule?.rule_attribute_attributevalue_ids.filter((x) => x.deleted)?.map((attr) => attr.id) ?? [];
          deleteRuleAttributeAttributeValueIds.push(...deleteAttributes);

          if (rule.id === -1) {
            newRules.push(newRule);
          }
        }
      });

      const responses = [];
      if (newRules.length) {
        responses.push(createRulesWithClausesAndEffects(newRules));
      }
      if (deleteRulesList.length) {
        responses.push(deleteRules(deleteRulesList));
      }
      if (newClausesList.length) {
        responses.push(createClauses(newClausesList));
      }
      if (updateClausesList.length) {
        responses.push(updateClauses(updateClausesList));
      }
      if (deleteClausesList.length) {
        responses.push(deleteClauses(deleteClausesList));
      }
      if (newRuleQuestionAnsweIds.length) {
        responses.push(createRuleQuestionAnswer(newRuleQuestionAnsweIds));
      }
      if (deleteRuleQuestionAnsweIds.length) {
        responses.push(deleteRuleQuestionAnswer(deleteRuleQuestionAnsweIds));
      }
      if (newRuleAttributeAttributeValueIds.length) {
        responses.push(createRuleAttributeAttributeValue(newRuleAttributeAttributeValueIds));
      }
      if (deleteRuleAttributeAttributeValueIds.length) {
        responses.push(deleteRuleAttributeAttributeValue(deleteRuleAttributeAttributeValueIds));
      }
      mutate(responses);
    },
    [dirtyFields.formData, mutate, pageData.formData],
  );

  const handleAddRule = useCallback(
    (attributeRule: boolean) => () =>
      append({
        id: -1,
        system_id,
        attribute_rule: attributeRule,
        deleted: false,
        clauses: [
          [
            {
              id: -1,
              rule_id: -1,
              compared_value: '',
              logical_group: uuidv4(),
              operator: OPERATOR.EQUAL,
              question_id: -1,
              deleted: false,
            },
          ],
        ],
        rule_question_answer_ids: [],
        rule_attribute_attributevalue_ids: [],
      }),
    [append, system_id],
  );

  const handleDeleteRule = useCallback(
    (rule: TRuleForForm, ruleIndex: number) => () => {
      if (rule.id === -1) {
        remove(ruleIndex);
      } else {
        update(ruleIndex, { ...rule, deleted: true });
      }
    },
    [remove, update],
  );

  useEffect(() => reset(pageData), [pageData, reset]);

  return (
    <main className={cnRules()}>
      <Dropdown
        options={questionsOptions}
        value={selectQuestion}
        label="Поиск по вопросам"
        onChange={handleQuestionSelect}
        className={cnRules('mainDropdown')}
      />
      <form onSubmit={handleSubmit(handleFormSubmit)} className={cnRules('form')}>
        <div className={cnRules('ruleList')}>
          {fields.map((rule, ruleIndex) => (
            <RuleField
              key={rule.arrayId}
              isVisible={!rule.deleted}
              ruleId={rule.id}
              control={control}
              ruleIndex={ruleIndex}
              attributeRule={rule.attribute_rule}
              handleDeleteRule={handleDeleteRule(rule, ruleIndex)}
            />
          ))}
        </div>
        <div className={cnRules('newRule')}>
          <div className={cnRules('newRule-button')} onClick={handleAddRule(false)}>
            <AddIcon width={30} height={30} className={cnRules('newRule-addIcon')} />
            <Text>{'"Вопрос - Вопрос"'}</Text>
          </div>
          <div className={cnRules('newRule-button')} onClick={handleAddRule(true)}>
            <AddIcon width={30} height={30} className={cnRules('newRule-addIcon')} />
            <Text>{'"Вопрос - Атрибут"'}</Text>
          </div>
        </div>
        <div className={cnRules('loadingScreen', { enabled: isLoading || isPending })} />
        <Button
          className={cnRules('submitButton', { visible: isFormDirty() })}
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
