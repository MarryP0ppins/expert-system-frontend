'use client';
import React, { use, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notFound, useRouter } from 'next/navigation';

import { TQueryKey } from '@/api';
import { emailVerifyPost } from '@/api/services/user';
import Loader from '@/components/Loader';
import Text from '@/components/Text';
import { USER } from '@/constants';
import useUserStore from '@/store/userStore';
import { classname } from '@/utils/classname';
import { errorParser } from '@/utils/errorParser';
import { verifyEmailValidation } from '@/validation/searchParams';

import classes from './page.module.scss';

const cnLoginPage = classname(classes, 'verifyEmailPage');

type VerifyEmailPageLayoutProps = {
  params: Promise<{ verify_code: string }>;
};

const Page: React.FC<VerifyEmailPageLayoutProps> = ({ params }) => {
  const verifyCodeParam = use(params).verify_code;
  const verify_code = verifyEmailValidation.safeParse(verifyCodeParam).data;

  if (!verify_code) {
    notFound();
  }

  const router = useRouter();
  const setStates = useUserStore((store) => store.setStates);
  const { isSuccess, error, data } = useQuery({
    queryKey: [USER.EMAILVERIFY, verify_code],
    queryFn: (params: TQueryKey<string | undefined>) => emailVerifyPost(params.queryKey[1] ?? ''),
    enabled: !!verify_code,
    gcTime: 0,
    staleTime: 0,
  });

  const parseError = useMemo(() => error && errorParser(error), [error]);

  useEffect(() => {
    if (isSuccess) {
      setStates({ user: data, isLogin: true });
      router.replace('/');
    }
  }, [data, isSuccess, router, setStates]);

  return (
    <main className={cnLoginPage('wrapper')}>
      {parseError ? <Text>{parseError.error}</Text> : <Loader sizepx={116} />}
    </main>
  );
};

export default Page;
