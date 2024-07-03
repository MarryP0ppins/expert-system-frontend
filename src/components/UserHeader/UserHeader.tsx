'use client';
import React from 'react';
import { useQueries } from '@tanstack/react-query';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getHistories } from '@/api/services/history';
import { getSystems } from '@/api/services/systems';
import { HISTORIES, SYSTEMS } from '@/constants';
import useUserStore from '@/store/userStore';
import { classname } from '@/utils/classname';

import Text, { TEXT_VIEW } from '../Text';

import classes from './UserHeader.module.scss';

const cnUserHeader = classname(classes, 'userHeader');

enum Section {
  PROFILE = 'profile',
  CREATED_SYSTEMS = 'systems',
  HISTORY = 'history',
}

const UserHeader: React.FC = () => {
  const selectedLayoutSegment = useSelectedLayoutSegment();

  const user = useUserStore((store) => store.user);

  useQueries({
    queries: [
      {
        queryKey: [HISTORIES.GET, { user: user?.id }],
        queryFn: (params: TQueryKey<{ user?: number }>) => getHistories({ user: params.queryKey[1].user ?? -1 }),
        enabled: !!user && selectedLayoutSegment !== Section.HISTORY,
      },
      {
        queryKey: [SYSTEMS.GET_USER, { user: user?.id, all_types: true }],
        queryFn: (params: TQueryKey<{ user?: number; all_types: boolean }>) => getSystems(params.queryKey[1]),
        enabled: !!user && selectedLayoutSegment !== Section.CREATED_SYSTEMS,
      },
    ],
  });

  return (
    <header className={cnUserHeader()}>
      <Link href={`/user/profile`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnUserHeader('section', {
            selected: selectedLayoutSegment === Section.PROFILE,
          })}
        >
          Профиль
        </Text>
      </Link>
      <Link href={`/user/systems`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnUserHeader('section', {
            selected: selectedLayoutSegment === Section.CREATED_SYSTEMS,
          })}
        >
          Созданные системы
        </Text>
      </Link>
      <Link href={`/user/history`}>
        <Text
          view={TEXT_VIEW.p18}
          className={cnUserHeader('section', {
            selected: selectedLayoutSegment === Section.HISTORY,
          })}
        >
          История
        </Text>
      </Link>
    </header>
  );
};

export default UserHeader;
