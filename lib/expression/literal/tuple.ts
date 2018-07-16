import * as Parsimmon from 'parsimmon';
import { OperatorTable } from '../../binOp';
import { commaSeparated_, parens } from '../../helpers';
import { expression } from '../../expression';

export const tuple = (ops: OperatorTable) =>
  Parsimmon.lazy(() => parens(commaSeparated_(expression(ops))).atLeast(2));
