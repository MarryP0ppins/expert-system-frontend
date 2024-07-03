import React from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { TQueryKey } from '@/api';
import { getSystems } from '@/api/services/systems';
import { PageStepper } from '@/components/PageStepper';
import { SYSTEMS } from '@/constants';
import { SearchSystemContainer } from '@/containers/SearchSystemContainer';
import { ReposContainer } from '@/containers/SystemsContainer';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';

import classes from './page.module.scss';

const cnAppPage = classname(classes, 'appPage');

const Page: React.FC = async () => {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [SYSTEMS.GET, { page: 1, per_page: 20 }],
    queryFn: (params: TQueryKey<{ page: number; per_page: number }>) => getSystems(params.queryKey[1]),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={cnAppPage()}>
        <SearchSystemContainer />
        <ReposContainer />
        <PageStepper />
      </div>
    </HydrationBoundary>
  );
};

export default Page;
