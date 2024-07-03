'use client';
import React, { useEffect, useMemo } from 'react';
import { useQueries, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { notFound, useParams, useSelectedLayoutSegment } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getAttributesWithValues } from '@/api/services/attributes';
import { getObjectsWithAttrValues } from '@/api/services/objects';
import { getQuestionsWithAnswers } from '@/api/services/questions';
import { getRulesWithClausesAndEffects } from '@/api/services/rules';
import { getSystemOne } from '@/api/services/systems';
import { ATTRIBUTES, OBJECTS, QUESTIONS, RULES, SYSTEMS } from '@/constants';
import useRulePageStore from '@/store/rulePageStore';
import useUserStore from '@/store/userStore';
import { TSystemsWithPage } from '@/types/systems';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';

import Text, { TEXT_VIEW } from '../Text';

import classes from './EditorHeader.module.scss';

const cnEditorHeader = classname(classes, 'editorHeader');

enum Section {
  SYSTEM = 'system',
  ATTRIBUTES = 'attributes',
  OBJECTS = 'objects',
  QUESTIONS = 'questions',
  RULES = 'rules',
}

// const getSection = (param: string | null): Section => {
//   switch (param) {
//     case 'attributes':
//       return Section.ATTRIBUTES;
//     case 'objects':
//       return Section.OBJECTS;
//     case 'questions':
//       return Section.QUESTIONS;
//     case 'rules':
//       return Section.RULES;
//     default:
//       return Section.SYSTEM;
//   }
// };

const EditorHeader: React.FC = () => {
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const { system_id } = useParams();
  const user = useUserStore((store) => store.user);
  const { setAttributes, setQuestions } = useRulePageStore((store) => store);
  const systemId = useMemo(() => Number(system_id), [system_id]);

  const queryClient = getQueryClient();

  const { data: systemData } = useSuspenseQuery({
    queryKey: [SYSTEMS.RETRIEVE, { system: systemId }],
    queryFn: (params: TQueryKey<{ system?: number }>) => getSystemOne(params.queryKey[1].system ?? -1),
    initialData: () =>
      queryClient
        .getQueryData<TSystemsWithPage>([SYSTEMS.GET_USER, { user: user?.id, all_types: true }])
        ?.systems.find((system) => system.id === systemId),
  });

  if (!systemData.id) {
    notFound();
  }

  const [attributeQueryResult, questionsQueryResult] = useQueries({
    queries: [
      {
        queryKey: [ATTRIBUTES.GET, { system: systemId }],
        queryFn: (params: TQueryKey<{ system?: number }>) => getAttributesWithValues(params.queryKey[1].system ?? -1),
        enabled:
          !!systemData && [Section.ATTRIBUTES, Section.RULES].every((section) => section !== selectedLayoutSegment),
      },
      {
        queryKey: [QUESTIONS.GET, { system: systemId }],
        queryFn: (params: TQueryKey<{ system?: number }>) => getQuestionsWithAnswers(params.queryKey[1].system ?? -1),
        enabled:
          !!systemData && [Section.QUESTIONS, Section.RULES].every((section) => section !== selectedLayoutSegment),
      },
      {
        queryKey: [RULES.GET, { system: systemId }],
        queryFn: (params: TQueryKey<{ system?: number }>) =>
          getRulesWithClausesAndEffects(params.queryKey[1].system ?? -1),
        enabled: !!systemData && selectedLayoutSegment !== Section.RULES,
      },
      {
        queryKey: [OBJECTS.GET, { system: systemId }],
        queryFn: (params: TQueryKey<{ system?: number }>) => getObjectsWithAttrValues(params.queryKey[1].system ?? -1),
        enabled: !!systemData && selectedLayoutSegment !== Section.OBJECTS,
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

  return (
    <header className={cnEditorHeader()}>
      <Link href={`/system/${systemId}/editor/system`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnEditorHeader('section', {
            selected: selectedLayoutSegment === Section.SYSTEM,
          })}
        >
          О системе
        </Text>
      </Link>
      <Link href={`/system/${systemId}/editor/attributes`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnEditorHeader('section', {
            selected: selectedLayoutSegment === Section.ATTRIBUTES,
          })}
        >
          Атрибуты
        </Text>
      </Link>
      <Link href={`/system/${systemId}/editor/objects`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnEditorHeader('section', {
            selected: selectedLayoutSegment === Section.OBJECTS,
          })}
        >
          Обьекты
        </Text>
      </Link>
      <Link href={`/system/${systemId}/editor/questions`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnEditorHeader('section', {
            selected: selectedLayoutSegment === Section.QUESTIONS,
          })}
        >
          Вопросы
        </Text>
      </Link>
      <Link href={`/system/${systemId}/editor/rules`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnEditorHeader('section', { selected: selectedLayoutSegment === Section.RULES })}
        >
          Правила
        </Text>
      </Link>
    </header>
  );
};

export default EditorHeader;
