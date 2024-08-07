import React from 'react';
import moment from 'moment';
import Link from 'next/link';

import Text, { TEXT_TAG, TEXT_VIEW, TEXT_WEIGHT } from '@/components/Text';
import CloseIcon from '@/icons/CloseIcon';
import { THistoryResult } from '@/types/history';
import { classname } from '@/utils/classname';
import { useDialogController } from '@/utils/useDialogController';

import Button from '../Button';
import ResultTable from '../ResultTable';

import classes from './HistoryCard.module.scss';

export type CardProps = {
  id: number;
  className?: string;
  title: string;
  systemId: number;
  answered_questions: string;
  results: THistoryResult[];
  started_at: string;
  finished_at: string;
};

const cnCard = classname(classes, 'history-card');

const HistoryCard: React.FC<CardProps> = ({
  className,
  id,
  title,
  answered_questions,
  systemId,
  results,
  started_at,
  finished_at,
}) => {
  const { dialogRef, openDialog, closeDialog } = useDialogController();

  return (
    <>
      <div className={cnCard() + ` ${className}`} id={String(id)} onClick={openDialog}>
        <Text
          tag={TEXT_TAG.span}
          view={TEXT_VIEW.p20}
          weight={TEXT_WEIGHT.medium}
          maxLines={4}
          className={cnCard('title')}
        >
          {title}
        </Text>
        <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" className={cnCard('subtitle')}>
          {`Отвечено вопросов: ${answered_questions}`}
        </Text>
        <div>
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" className={cnCard('subtitle')}>
            Время начала:
          </Text>
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" className={cnCard('subtitle')}>
            {moment(started_at).format('DD/MM/YYYY, hh:mm:ss')}
          </Text>
        </div>
        <div>
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" className={cnCard('subtitle')}>
            Время окончания:
          </Text>
          <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" className={cnCard('subtitle')}>
            {moment(finished_at).format('DD/MM/YYYY, hh:mm:ss')}
          </Text>

          <div>
            <Text tag={TEXT_TAG.span} view={TEXT_VIEW.p16} color="secondary" className={cnCard('subtitle')}>
              Результаты:
            </Text>
            {results.slice(0, 4).map((result, index) => (
              <Text
                key={index}
                tag={TEXT_TAG.span}
                view={TEXT_VIEW.p16}
                maxLines={1}
                color="secondary"
                title={result.result}
                className={cnCard('subtitle')}
              >
                {`${index + 1}. ${result.result}`}
              </Text>
            ))}
          </div>
        </div>
        <Link href={`/system/${systemId}/test`} className={cnCard('repeatButton')}>
          <Button>Пройти еще раз</Button>
        </Link>
      </div>

      <dialog className={cnCard('modal')} aria-label="Результаты тестирования" ref={dialogRef}>
        <CloseIcon className={cnCard('closeIcon')} onClick={closeDialog} />
        <Text view={TEXT_VIEW.p20} weight={TEXT_WEIGHT.bold} className={cnCard('modal-text')}>
          {title}
        </Text>
        <ResultTable
          title="Полные результаты тестирования"
          results={results.map((result) => ({ key: result.result, value: result.percent }))}
        />
      </dialog>
    </>
  );
};

export default HistoryCard;
