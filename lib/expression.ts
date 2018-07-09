import * as Parsimmon from 'parsimmon';
import {
  loName,
  upName,
  symbol,
  symbol_,
  parens,
  operator,
  emptyTuple,
  brackets,
  braces,
  commaSeparated,
  commaSeparated_,
  spaces_
} from './helpers';
import { OpTable } from './binOp';
import { string } from './expression/literal/string';
import { character } from './expression/literal/character';
import { application } from './expression/application';
import { integer } from './expression/literal/integer';
import { float } from './expression/literal/float';

const letBinding = (ops: OpTable) =>
  Parsimmon.lazy(
    (): Parsimmon.Parser<any> =>
      Parsimmon.seq(
        expression(ops).wrap(Parsimmon.optWhitespace, Parsimmon.optWhitespace),
        symbol('=').then(expression(ops))
      )
  );

const letExpression = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol_('let').then(letBinding(ops).atLeast(1)),
      symbol('in').then(expression(ops))
    )
  );

const ifExpression = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('if').then(expression(ops)),
      symbol('then').then(expression(ops)),
      symbol('else').then(expression(ops))
    )
  );

const lambda = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('\\').then(
        term(ops).wrap(Parsimmon.optWhitespace, Parsimmon.optWhitespace)
      ),
      symbol('->').then(expression(ops))
    )
  );

const variable = Parsimmon.alt(
  loName,
  upName.sepBy1(Parsimmon.string('.')),
  parens(operator),
  parens(Parsimmon.regex(/,+/)),
  emptyTuple
).desc('variable');

const list = (ops: OpTable) => Parsimmon.lazy(() => brackets(expression(ops)));

const access = Parsimmon.seq(
  variable,
  Parsimmon.string('.')
    .then(loName)
    .atLeast(1)
);

const accessFunction = Parsimmon.string('.').then(loName);

const tuple = (ops: OpTable) =>
  Parsimmon.lazy(() => parens(commaSeparated_(expression(ops))).atLeast(2));

// Record.

const record = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    braces(
      commaSeparated(Parsimmon.seq(loName, symbol('=').then(expression(ops))))
    )
  );

const recordUpdate = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('{').then(loName),
      symbol('|').then(
        commaSeparated(Parsimmon.seq(loName, symbol('=').then(expression(ops))))
      )
    ).skip(Parsimmon.string('}'))
  );

const simplifiedRecord = Parsimmon.lazy(() => braces(commaSeparated(loName)));

export const term = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.alt(
      access,
      variable,
      accessFunction,
      string,
      float,
      integer,
      character,
      parens(expression(ops).trim(Parsimmon.optWhitespace)),
      list(ops),
      tuple(ops),
      recordUpdate(ops),
      record(ops),
      simplifiedRecord
    )
  );




const binary = (ops: OpTable) => Parsimmon.lazy(() => application(ops));

export const expression = (ops: OpTable) =>
  Parsimmon.lazy((): Parsimmon.Parser<any> =>
    Parsimmon.alt(
      binary(ops),
      letExpression(ops),
      // caseExpression(ops),
      ifExpression(ops),
      lambda(ops)
    )
  );
