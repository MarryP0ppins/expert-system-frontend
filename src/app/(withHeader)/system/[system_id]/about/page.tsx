import React from 'react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getSystemOne } from '@/api/services/systems';
import Text, { TEXT_TAG, TEXT_VIEW } from '@/components/Text';
import StarIcon from '@/icons/StarIcon';
import defaultImage from '@/public/default-image.png';
import { classname } from '@/utils/classname';
import { imageUrl } from '@/utils/imageUrl';
import { starCountNormilize } from '@/utils/starCountNormilize';
import { systemIdValidation } from '@/validation/searchParams';

import classes from './page.module.scss';

const cnAboutPage = classname(classes, 'about');

type PageProps = {
  params: Promise<{ system_id: string }>;
};

const Page: React.FC<PageProps> = async ({ params }) => {
  const systemIdParam = (await params).system_id;
  const system_id = systemIdValidation.safeParse(systemIdParam).data;
  const cookie = (await cookies()).get('session_id');

  if (!system_id || !cookie) {
    notFound();
  }

  const data = await getSystemOne(system_id, { headers: { Cookie: `${cookie.name}=${cookie.value}` } });

  return (
    <div className={cnAboutPage()}>
      <div className={cnAboutPage('container')}>
        <Text view={TEXT_VIEW.title} tag={TEXT_TAG.div} className={cnAboutPage('title')}>
          Описание системы
        </Text>

        <div className={cnAboutPage('info')}>
          <div className={cnAboutPage('raw')}>
            <Image
              src={data.image_uri?.length ? imageUrl(data.image_uri) : defaultImage}
              alt={'Превью системы'}
              width={200}
              height={200}
              style={{
                objectFit: 'cover',
              }}
              quality={100}
              className={cnAboutPage('image')}
            />
            <div className={cnAboutPage('star')}>
              <StarIcon width={20} height={20} className={cnAboutPage('starIcon')} />
              <Text tag={TEXT_TAG.span}>{starCountNormilize(data.stars)}</Text>
            </div>
          </div>
          <div className={cnAboutPage('raw')}>
            <Text className={cnAboutPage('text')}>
              <b>Название:</b>
              {` ${data.name}`}
            </Text>
            <Text className={cnAboutPage('text')}>
              <b>Описание:</b>
              {` ${data.about ?? '-'}`}
            </Text>
          </div>
        </div>
        <Link href={`/system/${system_id}/test`} className={cnAboutPage('button')}>
          Пройти систему
        </Link>
      </div>
    </div>
  );
};

export default Page;
