'use client';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { notFound, useRouter, useSearchParams } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getAttributesWithValues } from '@/api/services/attributes';
import { getObjectsWithAttrValues } from '@/api/services/objects';
import { getQuestionsWithAnswers } from '@/api/services/questions';
import { getRulesWithClausesAndEffects } from '@/api/services/rules';
import { getSystemOne } from '@/api/services/systems';
import Text, { TEXT_VIEW } from '@/components/Text';
import { ATTRIBUTES, OBJECTS, QUESTIONS, RULES, SYSTEMS } from '@/constants';
import useRulePageStore from '@/store/rulePageStore';
import useUserStore from '@/store/userStore';
import { TSystemsWithPage } from '@/types/systems';
import { classname } from '@/utils/classname';
import { systemIdValidation } from '@/validation/searchParams';

import classes from './layout.module.scss';

const cnMainLayout = classname(classes, 'system-editor-layout');

enum Section {
  SYSTEM = 'system',
  ATTRIBUTES = 'attributes',
  OBJECTS = 'objects',
  QUESTIONS = 'questions',
  RULES = 'rules',
}

const getSection = (param: string | null): Section => {
  switch (param) {
    case 'attributes':
      return Section.ATTRIBUTES;
    case 'objects':
      return Section.OBJECTS;
    case 'questions':
      return Section.QUESTIONS;
    case 'rules':
      return Section.RULES;
    default:
      return Section.SYSTEM;
  }
};

type SystemEditorPageLayoutProps = {
  system: React.ReactNode;
  attributes: React.ReactNode;
  objects: React.ReactNode;
  questions: React.ReactNode;
  rules: React.ReactNode;
  params: { system_id: number };
};

const Layout: React.FC<SystemEditorPageLayoutProps> = ({ system, attributes, objects, questions, rules, params }) => {
  const router = useRouter();
  const user = useUserStore((store) => store.user);
  const { setAttributes, setQuestions } = useRulePageStore((store) => store);
  const system_id = useMemo(() => systemIdValidation.safeParse(params).data?.system_id, [params]);
  const searchParams = useSearchParams();
  const [section, setSection] = useState<Section>(getSection(searchParams.get('section')));
  const queryClient = useQueryClient();
  const { data: systemData, status } = useQuery({
    queryKey: [SYSTEMS.RETRIEVE, { system: system_id }],
    queryFn: (params: TQueryKey<{ system?: number }>) => getSystemOne(params.queryKey[1].system ?? -1),
    initialData: () =>
      queryClient
        .getQueryData<TSystemsWithPage>([SYSTEMS.GET_USER, { user: user?.id, all_types: true }])
        ?.systems.find((system) => system.id === system_id),
  });

  useEffect(() => {
    if (status === 'error') {
      notFound();
    }
  }, [status]);

  const [attributeQueryResult, questionsQueryResult] = useQueries({
    queries: [
      {
        queryKey: [ATTRIBUTES.GET, { system: systemData?.id }],
        queryFn: (params: TQueryKey<{ system?: number }>) => getAttributesWithValues(params.queryKey[1].system ?? -1),
        enabled: !!systemData && ![Section.ATTRIBUTES, Section.RULES].includes(section),
      },
      {
        queryKey: [QUESTIONS.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system?: number }>) => getQuestionsWithAnswers(params.queryKey[1].system ?? -1),
        enabled: !!systemData && ![Section.QUESTIONS, Section.RULES].includes(section),
      },
      {
        queryKey: [RULES.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system?: number }>) =>
          getRulesWithClausesAndEffects(params.queryKey[1].system ?? -1),
        enabled: !!systemData && section !== Section.RULES,
      },
      {
        queryKey: [OBJECTS.GET, { system: system_id }],
        queryFn: (params: TQueryKey<{ system?: number }>) => getObjectsWithAttrValues(params.queryKey[1].system ?? -1),
        enabled: !!systemData && section !== Section.OBJECTS,
      },
    ],
  });
  const memoQueryResult = useMemo(
    () => ({
      attributesIsSuccess: attributeQueryResult.isSuccess,
      attributesData: attributeQueryResult.data ?? [],
      questionsIsSuccess: questionsQueryResult.isSuccess,
      questionsData: questionsQueryResult.data ?? [],
    }),
    [attributeQueryResult, questionsQueryResult],
  );
  useEffect(() => {
    if (memoQueryResult.attributesIsSuccess) {
      setAttributes(memoQueryResult.attributesData);
    }
    if (memoQueryResult.questionsIsSuccess) {
      setQuestions(memoQueryResult.questionsData);
    }
  }, [memoQueryResult, setAttributes, setQuestions]);

  useLayoutEffect(() => {
    if (section !== Section.SYSTEM) {
      router.prefetch(`/system/${system_id}/editor?section=${Section.SYSTEM}`);
    }
    if (section !== Section.ATTRIBUTES) {
      router.prefetch(`/system/${system_id}/editor?section=${Section.ATTRIBUTES}`);
    }
    if (section !== Section.OBJECTS) {
      router.prefetch(`/system/${system_id}/editor?section=${Section.OBJECTS}`);
    }
    if (section !== Section.QUESTIONS) {
      router.prefetch(`/system/${system_id}/editor?section=${Section.QUESTIONS}`);
    }
    if (section !== Section.RULES) {
      router.prefetch(`/system/${system_id}/editor?section=${Section.RULES}`);
    }
  }, [router, section, system_id]);

  const sectionSelect = useCallback(
    (chptr: Section) => () => {
      router.replace(`/system/${system_id}/editor?section=${chptr}`);
      setSection(chptr);
    },
    [router, system_id],
  );

  const memoSectoion = useMemo(() => {
    switch (section) {
      case Section.ATTRIBUTES:
        return attributes;
      case Section.OBJECTS:
        return objects;
      case Section.QUESTIONS:
        return questions;
      case Section.RULES:
        return rules;
      default:
        return system;
    }
  }, [attributes, objects, questions, rules, section, system]);

  return (
    <>
      <div className={cnMainLayout()}>
        <header className={cnMainLayout('header')}>
          <Text
            onClick={sectionSelect(Section.SYSTEM)}
            view={TEXT_VIEW.p18}
            className={cnMainLayout('section', { selected: section === Section.SYSTEM })}
          >
            О системе
          </Text>
          <Text
            onClick={sectionSelect(Section.ATTRIBUTES)}
            view={TEXT_VIEW.p18}
            className={cnMainLayout('section', { selected: section === Section.ATTRIBUTES })}
          >
            Атрибуты
          </Text>
          <Text
            onClick={sectionSelect(Section.OBJECTS)}
            view={TEXT_VIEW.p18}
            className={cnMainLayout('section', { selected: section === Section.OBJECTS })}
          >
            Обьекты
          </Text>
          <Text
            onClick={sectionSelect(Section.QUESTIONS)}
            view={TEXT_VIEW.p18}
            className={cnMainLayout('section', { selected: section === Section.QUESTIONS })}
          >
            Вопросы
          </Text>
          <Text
            onClick={sectionSelect(Section.RULES)}
            view={TEXT_VIEW.p18}
            className={cnMainLayout('section', { selected: section === Section.RULES })}
          >
            Правила
          </Text>
        </header>
        {status === 'success' && memoSectoion}
      </div>
    </>
  );
};

export default Layout;
