import * as Parsimmon from 'parsimmon';
import { symbol, symbol_ } from './helpers';
import { OpTable } from './binOp';

const letBinding = (ops: OpTable) =>
  Parsimmon.lazy((): Parsimmon.Parser<any> =>
    Parsimmon.seq(
      expression(ops).wrap(Parsimmon.optWhitespace, Parsimmon.optWhitespace),
      symbol('=').then(expression(ops))
    )
  );

const letExpression = (ops: OpTable) =>
  Parsimmon.lazy((): Parsimmon.Parser<any> =>
    Parsimmon.seq(
      symbol_('let').then(letBinding(ops).atLeast(1)),
      symbol('in').then(expression(ops))
    )
  );

export const expression = (ops: OpTable) =>
  Parsimmon.lazy((): Parsimmon.Parser<any> =>
    Parsimmon.alt(
      //binary(ops),
      letExpression(ops)
      // caseExpression(ops),
      // ifExpression(ops),
      // lambda(ops)
    )
  );
