'use client';
import { ReactNode, useEffect, useLayoutEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { redirect, usePathname, useSearchParams } from 'next/navigation';

import { userResponse } from '@/api/services/user';
import { USER } from '@/constants';
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

  const setStates = useUserStore((store) => store.setStates);

  const { data, isSuccess, isError } = useQuery({
    queryKey: [USER.COOKIE],
    queryFn: userResponse,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (isSuccess) {
      setStates({ isLogin: true, user: data });
    }
    if (isError) {
      setStates({ isLogin: false });
    }
  }, [data, isError, isSuccess, setStates]);

  useLayoutEffect(() => {
    if (!Cookies.get('session_id') && !allowURL.find((url) => new RegExp(url, 'm').test(pathname))) {
      redirect(`/login?back_uri=${pathname}?${searchParams.toString()}`);
    }
  }, [pathname, searchParams]);

  return children;
};
