import React from 'react';

import UserHeader from '@/components/UserHeader';
import { classname } from '@/utils/classname';

import classes from './layout.module.scss';

const cnUserPage = classname(classes, 'userPage-layout');

type UserPageLayoutProps = {
  children: React.ReactNode;
};

const UserPageLayout: React.FC<UserPageLayoutProps> = ({ children }) => {
  return (
    <div className={cnUserPage()}>
      <UserHeader />
      {children}
    </div>
  );
};

export default UserPageLayout;
