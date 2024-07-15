'use client';
import React, { ChangeEvent, MouseEventHandler, ReactNode, useCallback, useState } from 'react';
import Popup from 'reactjs-popup';
import Image from 'next/image';
import Link from 'next/link';

import Text, { TEXT_TAG, TEXT_VIEW, TEXT_WEIGHT } from '@/components/Text';
import CloseIcon from '@/icons/CloseIcon';
import DotsIcon from '@/icons/DotsIcon';
import DownloadIcon from '@/icons/DownloadIcon';
import EditIcon from '@/icons/EditIcon';
import InfoIcon from '@/icons/InfoIcon';
import StarIcon from '@/icons/StarIcon';
import TrashIcon from '@/icons/TrashIcon';
import defaultImage from '@/public/default-image.png';
import { classname } from '@/utils/classname';
import { imageUrl } from '@/utils/imageUrl';
import { starCountNormilize } from '@/utils/starCountNormilize';
import { useDialogController } from '@/utils/useDialogController';

import Button from '../Button';
import Input from '../Input';

import classes from './Card.module.scss';

export type CardProps = {
  id: number;
  className?: string;
  image?: string;
  title: ReactNode;
  subtitle: ReactNode;
  stars: number;
  canLike: boolean;
  likeMap: Map<number, number>;
  userPageOption?: boolean;
  onClick?: MouseEventHandler;
  onDeleteClick?: (id: number, password: string) => void;
  onDownloadClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onLikeMap?: ({ add, system_id }: { add: boolean; system_id: number }) => void;
};

const cnCard = classname(classes, 'card');

const Card: React.FC<CardProps> = ({
  className,
  id,
  image,
  title,
  stars,
  subtitle,
  canLike,
  likeMap,
  userPageOption = false,
  onClick,
  onDeleteClick,
  onLikeMap,
  onDownloadClick,
}: CardProps) => {
  const { dialogRef, openDialog, closeDialog } = useDialogController();
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [password, setPassword] = useState('');

  const resetPassword = useCallback(() => {
    setPassword('');
    closeDialog();
  }, [closeDialog]);

  const closeOptionPopup = useCallback(() => setIsOptionOpen(false), []);
  const openOptionPopup = useCallback(() => setIsOptionOpen(true), []);

  const errorHandler = useCallback(() => setIsError(true), []);
  const handleDelete = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDeleteClick?.(id, password);
      resetPassword();
    },
    [onDeleteClick, id, password, resetPassword],
  );

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.currentTarget.value),
    [],
  );

  const updateLikeHandle = useCallback(
    (add: boolean) => (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onLikeMap?.({ add, system_id: id });
    },
    [id, onLikeMap],
  );

  const stopPropagation = useCallback((event: React.MouseEvent<HTMLElement>) => event.stopPropagation(), []);
  return (
    <div className={cnCard() + ` ${className}`} onClick={onClick}>
      <Image
        alt="logo"
        src={isError || !image ? defaultImage : imageUrl(image)}
        className={cnCard('image')}
        width={280}
        height={280}
        style={{
          objectFit: 'cover',
        }}
        quality={100}
        onError={errorHandler}
      />
      <div className={cnCard('info')}>
        <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p20} weight={TEXT_WEIGHT.medium} maxLines={2}>
          {title}
        </Text>
        <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" maxLines={3} className={cnCard('subtitle')}>
          {subtitle}
        </Text>
      </div>
      <div className={cnCard('stats')}>
        <div
          className={cnCard('star', { active: likeMap.has(id) && canLike, canLike })}
          onClick={updateLikeHandle(!likeMap.has(id))}
        >
          <StarIcon width={20} height={20} className={cnCard('starIcon')} />
          <Text tag={TEXT_TAG.span}>{starCountNormilize(stars)}</Text>
        </div>
      </div>
      {userPageOption && (
        <>
          <TrashIcon width={24} height={24} onClick={openDialog} className={cnCard('deleteIcon')} />
          <dialog
            aria-label="Подтверждение удаления"
            className={cnCard('modal')}
            ref={dialogRef}
            onClick={stopPropagation}
          >
            <CloseIcon className={cnCard('closeIcon')} onClick={resetPassword} />

            <Text view={TEXT_VIEW.p20} weight={TEXT_WEIGHT.bold} className={cnCard('modal-text')}>
              Подтверждение удаления
            </Text>
            <Text view={TEXT_VIEW.p16} className={cnCard('modal-text')}>
              {`Для подтверждения удаления Вам необходимо ввести пароль от вашей учетной записи.`}
            </Text>
            <Input
              value={password}
              onChange={onInputChange}
              className={cnCard('input', { modal: true })}
              required
              placeholder={'введите пароль'}
              autoComplete="password"
              type="password"
            />
            <Button className={cnCard('button')} onClick={handleDelete}>
              Удалить систему
            </Button>
          </dialog>
        </>
      )}
      <Popup
        open={isOptionOpen}
        trigger={<DotsIcon width={32} height={32} className={cnCard('dotsIcon', { active: isOptionOpen })} />}
        position="bottom left"
        repositionOnResize
        onClose={closeOptionPopup}
        onOpen={openOptionPopup}
      >
        <div className={cnCard('popup')} onClick={closeOptionPopup}>
          <Link href={`/system/${id}/about`} className={cnCard('options')}>
            <InfoIcon />
            <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
              О системе
            </Text>
          </Link>
          {userPageOption && (
            <>
              <Link href={`/system/${id}/editor/system`} className={cnCard('options')}>
                <EditIcon />
                <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
                  Редактировать
                </Text>
              </Link>
              <div className={cnCard('options')} onClick={onDownloadClick}>
                <DownloadIcon />
                <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p18}>
                  Скачать копию
                </Text>
              </div>
            </>
          )}
        </div>
      </Popup>
    </div>
  );
};

export default Card;
