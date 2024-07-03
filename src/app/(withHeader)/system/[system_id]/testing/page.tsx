import React from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { TQueryKey } from '@/api';
import { getSystemOne } from '@/api/services/systems';
import TestContainer from '@/containers/testing/TestContainer';
import { classname } from '@/utils/classname';

import classes from './page.module.scss';

const cnAppPage = classname(classes, 'appPage');

type TestingPageProps = {
  params: { system_id: number };
};

const Page: React.FC<TestingPageProps> = async ({ params }) => {
  const system_id = Number(params.system_id);
  console.log(system_id);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['testing', { system: system_id }],
    queryFn: (params: TQueryKey<{ system: number }>) => getSystemOne(params.queryKey[1].system),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={cnAppPage()}>Hello</div>
      <TestContainer />
    </HydrationBoundary>
  );
};

export default Page;
