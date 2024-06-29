'use client';
import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getSystems } from '@/api/services/systems';
import { Card } from '@/components/Card';
import { CardSkeleton } from '@/components/CardSkeleton';
import Text, { TEXT_VIEW } from '@/components/Text';
import { SYSTEMS } from '@/constants';
import useSystemsSearchParamsStore from '@/store/systemsSearchParamsStore';
import { classname } from '@/utils/classname';
import { mainPageSearchParamsParse } from '@/utils/searchParams';

import classes from './SystemsContainer.module.scss';

const cnSystemsContainer = classname(classes, 'systemsContainer');

const SystemsContainer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPage, pagesCount, name, username, setSystemsSearchParams } = useSystemsSearchParamsStore(
    (store) => store,
  );
  const validateParams = useMemo(() => mainPageSearchParamsParse(searchParams), [searchParams]);

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [
      SYSTEMS.GET,
      {
        page: currentPage,
        per_page: 20,
        name,
        username,
      },
    ],
    queryFn: (params: TQueryKey<{ page: number; per_page: number; name?: string; username?: string }>) =>
      getSystems(params.queryKey[1]),
  });

  const handleClick = useCallback((id: number) => () => router.push(`/system/${id}/test`), [router]);

  useLayoutEffect(
    () => setSystemsSearchParams({ ...validateParams, pagesCount: data?.pages, currentPage: validateParams.page }),
    [setSystemsSearchParams, data, validateParams],
  );

  return (
    <div className={cnSystemsContainer()}>
      {!!data?.systems.length &&
        isSuccess &&
        data.systems.map((system) => (
          <Card
            id={system.id}
            key={system.id}
            image={system.image_uri}
            title={system.name}
            subtitle={system.about}
            onClick={handleClick(system.id)}
          />
        ))}
      {!isLoading && currentPage > pagesCount && <Text view={TEXT_VIEW.p20}>Страница не найдена</Text>}
      {isLoading && [...Array(20).keys()].map((index) => <CardSkeleton key={index} />)}
    </div>
  );
};

export default SystemsContainer;
