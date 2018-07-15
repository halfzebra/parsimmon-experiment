import Parsimmon from 'parsimmon';
import {
  braces,
  brackets,
  commaSeparated,
  countIndent,
  loName,
  operator,
  parens,
  spaces,
  symbol,
  symbol_,
  whitespace
} from './helpers';
import { OpTable } from './binOp';
import { string } from './expression/literal/string';
import { character } from './expression/literal/character';
import { application } from './expression/application';
import { integer } from './expression/literal/integer';
import { float } from './expression/literal/float';
import { tuple } from './expression/literal/tuple';
import { variable } from './expression/variable';

const letBinding = (ops: OpTable) =>
  Parsimmon.lazy(
    (): Parsimmon.Parser<any> =>
      Parsimmon.seq(
        expression(ops).trim(whitespace),
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
      symbol('\\').then(term(ops).trim(spaces)),
      symbol('->').then(expression(ops))
    )
  );

const list = (ops: OpTable) => Parsimmon.lazy(() => brackets(expression(ops)));

const access = Parsimmon.seq(
  variable,
  Parsimmon.string('.')
    .then(loName.node())
    .atLeast(1)
).node('access');

export const accessFunction = Parsimmon.string('.')
  .then(loName)
  .desc('accessFunction');

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

const operatorOrAsBetween = Parsimmon.lazy(() =>
  operator.or(symbol_('as')).trim(whitespace)
);

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
      parens(expression(ops).trim(whitespace)),
      list(ops),
      tuple(ops),
      recordUpdate(ops),
      record(ops),
      simplifiedRecord
    )
  );

const exactIndentation = (int: number) =>
  Parsimmon.regex(new RegExp('\n*[ \t]{' + int.toString() + '}\n*'));

const binding = (ops: OpTable, indentation: number) =>
  Parsimmon.seq(
    exactIndentation(indentation).then(expression(ops)),
    symbol('->').then(expression(ops))
  ).desc('binding');

const caseExpression = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('case')
        .then(expression(ops))
        .then(whitespace)
        .then(Parsimmon.string('of')),
      countIndent.chain(indentation => binding(ops, indentation).atLeast(1))
    )
  );

const successOrEmptyList = (p: Parsimmon.Parser<any>) =>
  Parsimmon.alt(p, Parsimmon.succeed([]));

const binary = (ops: OpTable) =>
  Parsimmon.lazy(() => {
    const next: Parsimmon.Parser<string[]> = operatorOrAsBetween.chain(op =>
      Parsimmon.lazy(() =>
        application(ops)
          .map(a => ({ cont: a }))
          .or(expression(ops).map(e => ({ stop: e })))
          .chain(e => {
            if ('cont' in e) {
              return successOrEmptyList(next).map(l => [[op, e.cont], ...l]);
            }
            return Parsimmon.succeed([op, e.stop]);
          })
      )
    );

    return application(ops).chain(e => {
      return successOrEmptyList(next);
    });
  });

export const expression = (ops: OpTable): Parsimmon.Parser<any> =>
  Parsimmon.lazy(
    (): Parsimmon.Parser<any> =>
      Parsimmon.alt(
        binary(ops),
        letExpression(ops),
        caseExpression(ops),
        ifExpression(ops),
        lambda(ops)
      ).desc('expression')
  );
