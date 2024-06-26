import { OPERATOR } from '@/constants';
import { TAnswer } from '@/types/answers';
import { TRule } from '@/types/rules';

export const clausesCheck = ({ collectedAnswers, rules }: { collectedAnswers: TAnswer[]; rules: TRule[] }): TRule[] => {
  const result: TRule[] = [];
  rules.forEach((rule) => {
    const clausesGroupMatch: Map<string, boolean> = new Map();

    rule.clauses.forEach((clause) => {
      const question = collectedAnswers.find((answer) => answer.question_id === clause.question_id);

      let comparisonResult = true;
      switch (clause.operator) {
        case OPERATOR.EQUAL:
          comparisonResult = question?.body === clause.compared_value;
          break;
        case OPERATOR.NOT_EQUAL:
          comparisonResult = question?.body !== clause.compared_value;
          break;
        case OPERATOR.ABOVE:
          comparisonResult = Number(question?.body) > Number(clause.compared_value);
          break;
        case OPERATOR.BELOW:
          comparisonResult = Number(question?.body) < Number(clause.compared_value);
          break;
        case OPERATOR.NO_LESS_THAN:
          comparisonResult = Number(question?.body) >= Number(clause.compared_value);
          break;
        case OPERATOR.NO_MORE_THAN:
          comparisonResult = Number(question?.body) <= Number(clause.compared_value);
          break;
      }

      const mapValue = clausesGroupMatch.has(clause.logical_group);
      if (mapValue) {
        clausesGroupMatch.set(clause.logical_group, !!clausesGroupMatch.get(clause.logical_group) && comparisonResult);
      } else {
        clausesGroupMatch.set(clause.logical_group, comparisonResult);
      }
    });

    const matched = Array.from(clausesGroupMatch, ([, clauseMatch]) => clauseMatch).some((clauseGroup) => clauseGroup);

    if (matched) {
      result.push(rule);
    }
  });

  return result;
};
