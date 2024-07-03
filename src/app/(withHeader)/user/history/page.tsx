'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import { TQueryKey } from '@/api';
import { getHistories } from '@/api/services/history';
import { CardSkeleton } from '@/components/CardSkeleton';
import HistoryCard from '@/components/HistoryCard';
import Loader from '@/components/Loader';
import Text, { TEXT_VIEW } from '@/components/Text';
import { HISTORIES } from '@/constants';
import useUserStore from '@/store/userStore';
import { classname } from '@/utils/classname';

import classes from './page.module.scss';

const cnHistory = classname(classes, 'history');

const Page: React.FC = () => {
  const user = useUserStore((store) => store.user);

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [HISTORIES.GET, { user: user?.id }],
    queryFn: (params: TQueryKey<{ user?: number }>) => getHistories({ user: params.queryKey[1].user ?? -1 }),
    enabled: !!user,
  });

  return (
    <div className={cnHistory()}>
      {!!data?.length &&
        isSuccess &&
        data.map((system, index) => (
          <HistoryCard key={index} {...system} systemId={system.system.id} title={system.system.name} />
        ))}
      {!isLoading && !data?.length && <Text view={TEXT_VIEW.p20}>Нет пройденных систем</Text>}
      {isLoading && [...Array(6).keys()].map((index) => <CardSkeleton key={index} />)}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false, loading: () => <Loader sizepx={116} /> });
