import * as Parsimmon from 'parsimmon';
import { OpTable } from '../binOp';
import { term } from '../expression';

export const application = (ops: OpTable) => Parsimmon.lazy(() => term(ops));
