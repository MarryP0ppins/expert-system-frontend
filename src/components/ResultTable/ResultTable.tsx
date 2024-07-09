import React from 'react';

import { classname } from '@/utils/classname';

import Text, { TEXT_TAG, TEXT_VIEW } from '../Text';

import classes from './ResultTable.module.scss';

type ResultTableProps = {
  title: string;
  results: { key: string; value: number }[];
};

const cnFields = classname(classes, 'resultTable');

const ResultTable: React.FC<ResultTableProps> = ({ title, results }) => {
  return (
    <div className={cnFields()}>
      <Text view={TEXT_VIEW.p18} tag={TEXT_TAG.span} className={cnFields('title')}>
        {title}
      </Text>
      <div className={cnFields('scroll')}>
        <table className={cnFields('table')}>
          <tbody>
            {results.map((result, resultIndex) => (
              <tr key={result.key} className={cnFields('result')}>
                <td>
                  <Text tag={TEXT_TAG.span}>{resultIndex + 1}</Text>
                </td>
                <td>
                  <Text tag={TEXT_TAG.span} title={result.key}>
                    {result.key.length > 18 ? `${result.key.slice(0, 16)}...` : result.key}
                  </Text>
                </td>
                <td>
                  <Text tag={TEXT_TAG.span}>{result.value.toFixed(2)}%</Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
