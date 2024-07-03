import React from 'react';
import { notFound } from 'next/navigation';

// import { TQueryKey } from '@/api';
// import { getAttributesWithValues } from '@/api/services/attributes';
// import { getObjectsWithAttrValues } from '@/api/services/objects';
// import { getQuestionsWithAnswers } from '@/api/services/questions';
// import { getRulesWithClausesAndEffects } from '@/api/services/rules';
// import { getSystemOne } from '@/api/services/systems';
import EditorHeader from '@/components/EditorHeader';
// import { ATTRIBUTES, OBJECTS, QUESTIONS, RULES, SYSTEMS } from '@/constants';
import { classname } from '@/utils/classname';
import { systemIdValidation } from '@/validation/searchParams';

import classes from './layout.module.scss';

const cnMainLayout = classname(classes, 'system-editor-layout');

type SystemEditorPageLayoutProps = {
  children: React.ReactNode;
  params: { system_id: number };
};

const Layout: React.FC<SystemEditorPageLayoutProps> = ({ children, params }) => {
  const system_id = systemIdValidation.safeParse(params).data?.system_id;

  //const queryClient = getQueryClient();
  //const queryClient = new QueryClient();
  if (!system_id) {
    notFound();
  }

  // await queryClient.prefetchQuery({
  //   queryKey: [SYSTEMS.RETRIEVE, { system: system_id }],
  //   queryFn: (params: TQueryKey<{ system?: number }>) => getSystemOne(params.queryKey[1].system ?? -1),
  // });
  // await queryClient.prefetchQuery({
  //   queryKey: [ATTRIBUTES.GET, { system: system_id }],
  //   queryFn: (params: TQueryKey<{ system?: number }>) => getAttributesWithValues(params.queryKey[1].system ?? -1),
  // });
  // await queryClient.prefetchQuery({
  //   queryKey: [QUESTIONS.GET, { system: system_id }],
  //   queryFn: (params: TQueryKey<{ system?: number }>) => getQuestionsWithAnswers(params.queryKey[1].system ?? -1),
  // });
  // await queryClient.prefetchQuery({
  //   queryKey: [RULES.GET, { system: system_id }],
  //   queryFn: (params: TQueryKey<{ system?: number }>) => getRulesWithClausesAndEffects(params.queryKey[1].system ?? -1),
  // });
  // await queryClient.prefetchQuery({
  //   queryKey: [OBJECTS.GET, { system: system_id }],
  //   queryFn: (params: TQueryKey<{ system?: number }>) => getObjectsWithAttrValues(params.queryKey[1].system ?? -1),
  // });

  return (
    <div className={cnMainLayout()}>
      <EditorHeader />
      {children}
    </div>
  );
};

export default Layout;
