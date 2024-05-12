'use client';
import React, { memo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Text, { TEXT_VIEW } from '@/components/Text';
import useUserStore from '@/store/userStore';
import { TUserLogin } from '@/types/user';
import { classname } from '@/utils';
import { userLoginValidation } from '@/validation/user';

import classes from './page.module.scss';

const cnLoginPage = classname(classes, 'loginPage');

const Page: React.FC = () => {
  const { register, handleSubmit, watch, clearErrors } = useForm<TUserLogin>({
    resolver: zodResolver(userLoginValidation),
  });
  const { loginUser, fetchloading, fetchError, clearFetchError } = useUserStore((store) => store);
  const handleLogin = useCallback((data: TUserLogin) => loginUser(data), [loginUser]);

  const formWatch = watch();

  useEffect(
    () => () => {
      clearFetchError();
      clearErrors();
    },
    [clearErrors, clearFetchError],
  );

  return (
    <main className={cnLoginPage('wrapper')}>
      <form className={cnLoginPage()} onSubmit={handleSubmit(handleLogin)}>
        <Text view={TEXT_VIEW.p20} className={cnLoginPage('title')}>
          Авторизация
        </Text>
        <Input
          {...register('email')}
          className={cnLoginPage('input')}
          placeholder="Почта"
          label={formWatch.email?.length ? 'Почта' : undefined}
          type="email"
          error={!!fetchError}
        />
        <Input
          {...register('password')}
          className={cnLoginPage('input')}
          placeholder="Пароль"
          label={formWatch.password?.length ? 'Пароль' : undefined}
          type="password"
          error={!!fetchError}
        />
        {!!fetchError && (
          <Text view={TEXT_VIEW.p14} className={cnLoginPage('err')}>
            {fetchError.extra ?? fetchError.error}
          </Text>
        )}
        <Button className={cnLoginPage('button')} loading={fetchloading}>
          Войти
        </Button>
        <Link href="/registration">
          <Text view={TEXT_VIEW.p14} className={cnLoginPage('reg')}>
            Регистрироваться
          </Text>
        </Link>
      </form>
    </main>
  );
};

export default memo(Page);
