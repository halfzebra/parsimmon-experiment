import * as Parsimmon from 'parsimmon';
import { OperatorTable } from '../../binOp';
import { commaSeparated2, parens } from '../../helpers';
import { expression } from '../../expression';

export const tuple = (ops: OperatorTable) =>
  Parsimmon.lazy(() => parens(commaSeparated2(expression(ops))));
