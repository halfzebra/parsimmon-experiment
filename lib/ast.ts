import Parsimmon from 'parsimmon';
import { OpTable, operators } from './binOp';
import { statement, statements, opTable } from './statement';
import { formatError } from './formatError';
import { expression } from './expression';

export const parseExpression = (ops: OpTable) =>
  expression(ops).skip(Parsimmon.eof);

export const parseModule = (ops: OpTable, input: string) => {
  // return statements(ops).parse(input);
  return parse_(statements(ops), input);
};

export const parseStatement = (ops: OpTable) =>
  statement(ops).skip(Parsimmon.eof);

export const parseOpTable = (ops: OpTable, input: string) =>
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
    return result.value;
  }

  // tslint:disable-next-line: no-console
  console.log(formatError(result, input));

  return result;
}
