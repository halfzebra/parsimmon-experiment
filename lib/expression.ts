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
  commaSeparated_
} from './helpers';
import { OpTable } from './binOp';

// const singleQuote = Parsimmon.string('\'');

// const character = Parsimmon.regex(/\\/).then(
//   Parsimmon.regex(/(n|t|r|\\\\|x..)/).wrap(singleQuote, singleQuote).map(x => {
//
//   })
// );

const sign: Parsimmon.Parser<number> = Parsimmon.alt(
  Parsimmon.string('+'),
  Parsimmon.string('-')
)
  .map(x => {
    if (x === '+') {
      return 1;
    }

    return -1;
  })
  .times(0, 1)
  .map(([x]) => x);

export const int = Parsimmon.seqMap(
  sign,
  Parsimmon.regex(/(0|[1-9][0-9]*)/).map(x => parseInt(x, 10)),
  (parsedSign: number = 1, parsed: number) => parsedSign * parsed
);

export const integer = int.desc('integer');

export const float = Parsimmon.seqMap(
  sign,
  Parsimmon.regex(/(0|[1-9][0-9]*)(\.[0-9]+)/).map(parseFloat),
  (parsedSign: number = 1, parsed: number) => parsedSign * parsed
);

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

const doubleQuote = Parsimmon.string(`"`);

const threeDoubleQuotes = Parsimmon.string(`"""`);

const singleString = doubleQuote
  .then(Parsimmon.regex(/(\\\\\\\\|\\\\\"|[^\"\n])*/))
  .skip(doubleQuote);

const multiString = threeDoubleQuotes
  .then(Parsimmon.regex(/[^\"]*/))
  .skip(threeDoubleQuotes);

export const string = singleString.or(multiString);

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
      // character,
      parens(expression(ops).trim(Parsimmon.optWhitespace)),
      list(ops),
      tuple(ops),
      recordUpdate(ops),
      record(ops),
      simplifiedRecord
    )
  );

const countIndent = Parsimmon.regexp(/\s*/).map(s => s.length);

// export const spacesOrIndentedNewline = (indentation: number) =>
//   Parsimmon.alt(
//     spaces_,
//     countIndent.chain(column => {
//       if (column < indentation) {
//         return Parsimmon.fail(
//           'Arguments have to be at least the same indentation as the function'
//         );
//       }
//       return Parsimmon.optWhitespace;
//     })
//   );

const application = (ops: OpTable) => Parsimmon.lazy(() => term(ops));

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
