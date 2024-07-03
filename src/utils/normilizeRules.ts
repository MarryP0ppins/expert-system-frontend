import { TClause } from '@/types/clauses';
import { TRuleAttributeAttributeValue } from '@/types/ruleAttributeAttributeValue';
import { TRuleQuestionAnswer } from '@/types/ruleQuestionAnswer';
import { TRule, TRuleForm } from '@/types/rules';

export const normilizeRules = (data: TRuleForm): TRule[] => {
  const rules: TRule[] = [];

  data.formData.forEach((rule) => {
    if (rule.deleted) {
      return;
    }

    const clauses: TClause[] = [];
    rule.clauses.forEach((clauseGroup) =>
      clauseGroup.forEach((clause) => {
        if (!clause.deleted) {
          clauses.push({ ...clause });
        }
      }),
    );

    const rule_question_answer_ids: TRuleQuestionAnswer[] = [];
    rule.rule_question_answer_ids.forEach((ids) => {
      if (!ids.deleted) {
        rule_question_answer_ids.push({ ...ids });
      }
    });

    const rule_attribute_attributevalue_ids: TRuleAttributeAttributeValue[] = [];
    rule.rule_attribute_attributevalue_ids.forEach((ids) => {
      if (!ids.deleted) {
        rule_attribute_attributevalue_ids.push({ ...ids });
      }
    });

    rules.push({ ...rule, clauses, rule_question_answer_ids, rule_attribute_attributevalue_ids });
  });

  return rules;
};
