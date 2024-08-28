'use client';
import React, { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

import { logoutUserResponse } from '@/api/services/user';
import { USER } from '@/constants';
import { LogoutIcon, UserIcon } from '@/icons';
import AddIcon from '@/icons/AddIcon';
import BookIcon from '@/icons/BookIcon';
import LoginIcon from '@/icons/LoginIcon';
import useUserStore from '@/store/userStore';
import { classname } from '@/utils/classname';
import { useDialogController } from '@/utils/useDialogController';

import Loader from '../Loader';
import Text, { TEXT_TAG, TEXT_VIEW } from '../Text';

import classes from './User.module.scss';

const cnUser = classname(classes, 'user');

const User: React.FC = () => {
  const { dialogRef, openDialog, closeDialog } = useDialogController();
  const router = useRouter();

  const {
    isLogin,
    reset: userStoreReset,
    user,
  } = useUserStore(useShallow((store) => ({ isLogin: store.isLogin, reset: store.reset, user: store.user })));

  const { mutate, isPending } = useMutation({
    mutationKey: [USER.LOGOUT],
    mutationFn: logoutUserResponse,
    onSuccess: () => {
      router.replace('/');
      Cookies.remove('session_id');
      userStoreReset();
    },
    gcTime: 0,
  });

  const handlelogout = useCallback(() => mutate(), [mutate]);

  return (
    <>
      <span>
        {!isPending && !isLogin ? (
          <Link href="/login" className={cnUser()}>
            <LoginIcon />
          </Link>
        ) : (
          <div className={cnUser({ disable: isPending })} onClick={isPending ? undefined : openDialog}>
            {!isPending && isLogin ? <UserIcon /> : <Loader size="s" />}
          </div>
        )}
      </span>
      <dialog ref={dialogRef} className={cnUser('popup')} onClick={closeDialog}>
        <div className={cnUser('username')}>
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18} color="secondary">
            {user?.username}
          </Text>
        </div>
        <Link href="/user/profile" className={cnUser('options')}>
          <UserIcon />
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
            Личный кабинет
          </Text>
        </Link>
        <Link href="/system/create" className={cnUser('options')}>
          <AddIcon />
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
            Новая система
          </Text>
        </Link>
        <Link href="/instruction" className={cnUser('options')}>
          <BookIcon />
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
            Инструкция
          </Text>
        </Link>
        <div className={cnUser('options', { isLogin })} onClick={handlelogout}>
          <LogoutIcon />
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
            Выйти
          </Text>
        </div>
      </dialog>
    </>
  );
};

export default User;
