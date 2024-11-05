import React, { Suspense } from 'react';
import moment from 'moment';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Providers } from '@/providers';
import { classname } from '@/utils/classname';

import './global.scss';
import classes from './layout.module.scss';

const cnMainLayout = classname(classes, 'mainLayout');

const inter = localFont({
  src: [
    {
      path: '../fonts/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/Inter_18pt-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal',
      
    },
  ],
});

export const metadata: Metadata = {
  title: 'ИПО ПЭС',
  description: 'Инструментальное программного обеспечение для построения экспертных систем',
};

moment.locale('ru');

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="ru" className={inter.className}>
      <body className={cnMainLayout()}>
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
