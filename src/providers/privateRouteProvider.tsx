'use client';
import { ReactNode, useEffect, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { redirect, usePathname, useSearchParams } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getLikes } from '@/api/services/likes';
import { userResponse } from '@/api/services/user';
import { LIKES, USER } from '@/constants';
import useUserStore from '@/store/userStore';

const allowURL = [
  /^\/$/,
  /^\/login$/,
  /^\/registration$/,
  /^\/system\/\d+\/test$/,
  /^\/verifyemail\/[a-zA-Z0-9]+$/,
  /^\/forgotpassword/,
  /^\/resetpassword\/[a-zA-Z0-9]+$/,
];

export const PrivateRouterProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { setStates } = useUserStore((store) => store);

  const { data: userData, status: userStatus } = useQuery({
    queryKey: [USER.COOKIE],
    queryFn: userResponse,
    staleTime: 1000 * 10,
    gcTime: 0,
  });
  useEffect(() => {
    if (userStatus === 'success') {
      setStates({ isLogin: true, user: userData });
    }
    if (userStatus === 'error') {
      setStates({ isLogin: false });
    }
  }, [userData, setStates, userStatus]);

  const { data: likesData, isFetched } = useQuery({
    queryKey: [LIKES.GET, { user: userData?.id }],
    queryFn: (params: TQueryKey<{ user?: number }>) => getLikes(params.queryKey[1].user ?? -1),
    enabled: !!userData,
  });

  useEffect(() => {
    if (isFetched) {
      const newMap = new Map(likesData?.map((like) => [like.system_id, like.id]));
      setStates({ likes: newMap });
    }
  }, [isFetched, likesData, setStates]);

  useLayoutEffect(() => {
    if (!Cookies.get('session_id') && !allowURL.find((url) => new RegExp(url, 'm').test(pathname))) {
      redirect(`/login?back_uri=${pathname}?${searchParams.toString()}`);
    }
  }, [pathname, searchParams]);

  return children;
};
