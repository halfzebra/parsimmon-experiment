import Parsimmon from 'parsimmon';
import { OperatorTable, operators } from './binOp';
import { statement, statements, opTable } from './statement';
import { formatError } from './formatError';
import { expression } from './expression';

export const parseExpression = (ops: OperatorTable) =>
  expression(ops).skip(Parsimmon.eof);

export const parseModule = (ops: OperatorTable, input: string) => {
  return parse_(statements(ops), input);
};

export const parseStatement = (ops: OperatorTable) =>
  statement(ops).skip(Parsimmon.eof);

export const parseOpTable = (ops: OperatorTable, input: string) =>
  parse_(opTable(ops), input);

export const parse = (input: string) => {
  const opTableResult = parseOpTable(operators, input);

  if (opTableResult.status) {
    return parseModule(opTableResult.value, input);
  }

  return opTableResult;
};

export function parse_(parser: Parsimmon.Parser<any>, input: string) {
  const result = parser.parse(input);

  if (result.status === true) {
    return result;
  }

  // tslint:disable-next-line: no-console
  console.log(formatError(result, input));

  return result;
}
