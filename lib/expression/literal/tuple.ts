import * as Parsimmon from 'parsimmon';
import { OpTable } from '../../binOp';
import { commaSeparated_, parens } from '../../helpers';
import { expression } from '../../expression';

export const tuple = (ops: OpTable) =>
  Parsimmon.lazy(() => parens(commaSeparated_(expression(ops))).atLeast(2));
