'use client';
import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

import { TQueryKey } from '@/api';
import { createLike, deleteLike } from '@/api/services/likes';
import { getSystems } from '@/api/services/systems';
import { Card } from '@/components/Card';
import { CardSkeleton } from '@/components/CardSkeleton';
import Text, { TEXT_VIEW } from '@/components/Text';
import { SYSTEMS } from '@/constants';
import useSystemsSearchParamsStore from '@/store/systemsSearchParamsStore';
import useUserStore from '@/store/userStore';
import { TSystemsWithPage } from '@/types/systems';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';
import { mainPageSearchParamsParse } from '@/utils/searchParams';

import classes from './SystemsContainer.module.scss';

const cnSystemsContainer = classname(classes, 'systemsContainer');

const SystemsContainer: React.FC = () => {
  const queryClient = getQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentPage, pagesCount, name, username, setSystemsSearchParams } = useSystemsSearchParamsStore(
    useShallow((store) => ({
      currentPage: store.currentPage,
      pagesCount: store.pagesCount,
      name: store.name,
      username: store.username,
      setSystemsSearchParams: store.setSystemsSearchParams,
    })),
  );
  const { user, likeMap, updateLikes } = useUserStore(
    useShallow((store) => ({ user: store.user, likeMap: store.likes, updateLikes: store.updateLikes })),
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

  const starAddMutation = useMutation({
    mutationFn: createLike,
    onSuccess: (newLike) => {
      updateLikes({ add: true, system_id: newLike.system_id, like_id: newLike.id });
      const systems = queryClient.getQueryData<TSystemsWithPage>([
        SYSTEMS.GET,
        {
          page: currentPage,
          per_page: 20,
          name,
          username,
        },
      ]);
      queryClient.setQueryData<TSystemsWithPage>(
        [
          SYSTEMS.GET,
          {
            page: currentPage,
            per_page: 20,
            name,
            username,
          },
        ],
        {
          pages: systems?.pages ?? -1,
          systems:
            systems?.systems.map((system) =>
              system.id === newLike.system_id ? { ...system, stars: system.stars + 1 } : system,
            ) ?? [],
        },
      );
    },
  });

  const starRemoveMutation = useMutation({
    mutationFn: ({ like_id, system_id }: { like_id: number; system_id: number }) => {
      deleteLike(like_id);
      return Promise.resolve(system_id);
    },
    onSuccess: (systemId) => {
      updateLikes({ add: false, system_id: systemId });
      const systems = queryClient.getQueryData<TSystemsWithPage>([
        SYSTEMS.GET,
        {
          page: currentPage,
          per_page: 20,
          name,
          username,
        },
      ]);
      queryClient.setQueryData<TSystemsWithPage>(
        [
          SYSTEMS.GET,
          {
            page: currentPage,
            per_page: 20,
            name,
            username,
          },
        ],
        {
          pages: systems?.pages ?? -1,
          systems:
            systems?.systems.map((system) =>
              system.id === systemId ? { ...system, stars: system.stars - 1 } : system,
            ) ?? [],
        },
      );
    },
  });

  const handleLikeUpdate = useCallback(
    ({ add, system_id }: { add: boolean; system_id: number }) => {
      if (user) {
        if (add) {
          starAddMutation.mutate({ system_id: system_id, user_id: user.id });
        } else {
          starRemoveMutation.mutate({ system_id: system_id, like_id: likeMap.get(system_id) ?? -1 });
        }
      }
    },
    [likeMap, starAddMutation, starRemoveMutation, user],
  );
  console.log(likeMap);
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
            stars={system.stars}
            likeMap={likeMap}
            canLike={!!user}
            onClick={handleClick(system.id)}
            onLikeMap={handleLikeUpdate}
          />
        ))}
      {!isLoading && currentPage > pagesCount && <Text view={TEXT_VIEW.p20}>Страница не найдена</Text>}
      {isLoading && [...Array(20).keys()].map((index) => <CardSkeleton key={index} />)}
    </div>
  );
};

export default SystemsContainer;
