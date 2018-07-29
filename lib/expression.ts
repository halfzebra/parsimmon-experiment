import Parsimmon from 'parsimmon';
import {
  braces,
  brackets,
  commaSeparated,
  commaSeparated1,
  countIndent,
  exactIndentation,
  loName,
  operator,
  parens,
  spaces,
  symbol,
  symbol_,
  whitespace
} from './helpers';
import { OperatorTable } from './binOp';
import { string } from './expression/literal/string';
import { character } from './expression/literal/character';
import { application } from './expression/application';
import { integer } from './expression/literal/integer';
import { float } from './expression/literal/float';
import { tuple } from './expression/literal/tuple';
import { variable } from './expression/variable';
import { dot, lbrace, rbrace } from './tokens';
import { lookahead } from './lookahead';

const letBinding = (ops: OperatorTable) =>
  Parsimmon.lazy(
    (): Parsimmon.Parser<any> =>
      Parsimmon.seq(
        expression(ops).trim(whitespace),
        symbol('=').then(expression(ops))
      )
  );

const letExpression = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol_('let').then(letBinding(ops).atLeast(1)),
      symbol('in').then(expression(ops))
    ).node('Let')
  );

const ifExpression = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('if').then(expression(ops)),
      symbol('then').then(expression(ops)),
      symbol('else').then(expression(ops))
    )
  );

const lambda = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('\\').then(term(ops).trim(spaces)),
      symbol('->').then(expression(ops))
    )
  );

const list = (ops: OperatorTable) =>
  Parsimmon.lazy(() => brackets(commaSeparated(expression(ops))));

const access = Parsimmon.seq(variable, dot.then(loName).atLeast(1)).node(
  'Access'
);

export const accessFunction = dot.then(loName).desc('accessFunction');

// Record.

const record = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    braces(
      commaSeparated1(
        Parsimmon.seq(loName, symbol('=').then(expression(ops)))
      ).or(whitespace)
    )
  ).node('Record');

const recordUpdate = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      lbrace.trim(whitespace).then(loName),
      symbol('|').then(
        commaSeparated1(
          Parsimmon.seq(loName, symbol('=').then(expression(ops)))
        )
      )
    ).skip(rbrace)
  ).node('RecordUpdate');

const simplifiedRecord = Parsimmon.lazy(() => braces(commaSeparated1(loName)));

const operatorOrAsBetween = Parsimmon.lazy(() =>
  operator.or(symbol_('as')).trim(whitespace)
);

export const term = (ops: OperatorTable) =>
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

const binding = (ops: OperatorTable, indentation: number) =>
  Parsimmon.seq(
    exactIndentation(indentation).then(expression(ops)),
    symbol('->').then(expression(ops))
  );

const caseExpression = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.seq(
      symbol('case').then(
        expression(ops)
          .skip(whitespace)
          .skip(Parsimmon.string('of'))
      ),
      lookahead(countIndent).chain(indentation =>
        binding(ops, indentation).atLeast(1)
      )
    ).node('Case')
  );

const successOrEmptyList = (p: Parsimmon.Parser<any>) =>
  Parsimmon.alt(p, Parsimmon.succeed([]));

const binary = (ops: OperatorTable) =>
  Parsimmon.lazy(() => {
    const next: Parsimmon.Parser<string[]> = operatorOrAsBetween.chain(op =>
      Parsimmon.lazy(() =>
        application(ops)
          .map(a => ({ Continue: a }))
          .or(expression(ops).map(e => ({ Stop: e })))
          .chain(e => {
            if ('Continue' in e) {
              return successOrEmptyList(next).map(l => [
                [op, e.Continue],
                ...l
              ]);
            }
            return Parsimmon.succeed([op, e.Stop]);
          })
      )
    );

    return application(ops).chain(e =>
      successOrEmptyList(next).chain(eops => split(ops, 0, e, eops))
    );
  });

const splitLevel = (
  ops: OperatorTable,
  l: number,
  e: any,
  eops: any[]
): Array<Parsimmon.Parser<any>> => [Parsimmon.succeed(true)];

const split = (
  ops: OperatorTable,
  l: number,
  e: any,
  eops: any[]
): Parsimmon.Parser<any> => {
  return eops.length === 0
    ? Parsimmon.succeed(e)
    : findAssoc(ops, l, eops).chain(assoc => {
        return Parsimmon.seq(...splitLevel(ops, l, e, eops)).chain(es => {
          const ops_ = eops
            .map(x => {
              if (hasLevel(ops, l, x)) {
                return x[0];
              }
              return null;
            })
            .filter(x => x !== null);

          return Parsimmon.succeed('hello');
        });
      });
};

const findAssoc = (ops: OperatorTable, l: number, eops: any[]) => {
  // Operator precedence.
  const lops = eops.filter(eop => hasLevel(ops, l, eop));
  // Operator associativity.

  return Parsimmon.succeed('Left');
};

const hasLevel = (ops: OperatorTable, l: number, [n]: [string]) => {
  return ops[n][1] === l;
};

export const expression = (ops: OperatorTable): Parsimmon.Parser<any> =>
  Parsimmon.lazy(
    (): Parsimmon.Parser<any> =>
      Parsimmon.alt(
        binary(ops),
        letExpression(ops),
        caseExpression(ops),
        ifExpression(ops),
        lambda(ops)
      )
  );
