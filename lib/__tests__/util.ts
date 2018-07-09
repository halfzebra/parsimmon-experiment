import { parseStatement, parse, parseExpression, parse_ } from '../ast';
import { operators } from '../binOp';
import { default as stripIndent } from 'strip-indent';

export const isExpression = (input: string) =>
  parse_(parseExpression(operators), input).status;

export const isStatement = (input: string) =>
  parse_(parseStatement(operators), input).status;

export const areStatements = (input: string) => parse(input).status;

export function unindent(str: TemplateStringsArray): string {
  return stripIndent(str[0].slice(1));
}
