import React, { useCallback } from 'react';
import { Control, useController, useFieldArray } from 'react-hook-form';

import AddIcon from '@/icons/AddIcon';
import CloseIcon from '@/icons/CloseIcon';
import { TQuestionWithAnswersForm } from '@/types/questions';
import { classname } from '@/utils/classname';

import CheckBox from '../CheckBox';
import ErrorPopup from '../ErrorPopup';
import Input from '../Input';
import Text, { TEXT_VIEW } from '../Text';

import AnswerField from './AnswerField';

import classes from './QuestionField.module.scss';

type QuestionFieldProps = {
  isVisible?: boolean;
  questionId: number;
  questionIndex: number;
  control: Control<TQuestionWithAnswersForm>;
  onDelete: () => void;
  onAnswerDelete: (AnswerId: number) => void;
  deletedSubFieldIds: number[];
};

const cnFields = classname(classes, 'fieldWithFields');

const QuestionField: React.FC<QuestionFieldProps> = ({
  isVisible = true,
  control,
  questionIndex,
  questionId,
  onDelete,
  onAnswerDelete,
  deletedSubFieldIds,
}) => {
  const {
    field: bodyField,
    fieldState: { error: bodyError },
  } = useController({ control, name: `formData.${questionIndex}.body` });
  const { field: choosesField } = useController({ control, name: `formData.${questionIndex}.with_chooses` });

  const { fields, append, remove } = useFieldArray({
    control,
    name: `formData.${questionIndex}.answers`,
    keyName: 'arrayId',
  });

  const handleDeleteAnswer = useCallback(
    (AnswerId: number, AnswerIndex: number) => () => {
      if (AnswerId === -1) {
        remove(AnswerIndex);
      } else {
        onAnswerDelete(AnswerId);
      }
    },
    [onAnswerDelete, remove],
  );
  const handleAddAnswer = useCallback(
    () => append({ id: -1, question_id: questionId, body: '' }),
    [append, questionId],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cnFields()}>
      <CloseIcon width={30} height={30} className={cnFields('delete')} onClick={onDelete} />
      <Input
        {...bodyField}
        className={cnFields('input')}
        label="Вопрос"
        placeholder="Вопрос"
        afterSlot={<ErrorPopup error={bodyError?.message} position="top right" offsetY={4} />}
        error={!!bodyError}
      />
      <div className={cnFields('checkbox')}>
        <CheckBox
          {...choosesField}
          value={String(choosesField.value)}
          checked={choosesField.value}
          className={cnFields('checkbox-input')}
        />
        <Text view={TEXT_VIEW.p16} className={cnFields('checkbox-label')}>
          С вариантами ответов
        </Text>
      </div>
      {choosesField.value && (
        <div className={cnFields('attrValues')}>
          {fields.map((attrValue, answerIndex) => (
            <AnswerField
              key={attrValue.arrayId}
              isVisible={!deletedSubFieldIds.includes(attrValue.id)}
              control={control}
              questionIndex={questionIndex}
              answerIndex={answerIndex}
              onDeleteClick={handleDeleteAnswer(attrValue.id, answerIndex)}
            />
          ))}
          <div className={cnFields('newValue')}>
            <AddIcon width={30} height={30} className={cnFields('newValue-addIcon')} onClick={handleAddAnswer} />
            <Input
              className={cnFields('newValue-input')}
              placeholder="Добавить вариант ответа"
              onClick={handleAddAnswer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionField;
