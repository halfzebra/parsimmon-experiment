import * as Parsimmon from 'parsimmon';

const reserved = [
  'module',
  'where',
  'import',
  'as',
  'exposing',
  'type',
  'alias',
  'port',
  'if',
  'then',
  'else',
  'let',
  'in',
  'case',
  'of'
];

function isReservedKeyword(k: string): boolean {
  return reserved.indexOf(k) !== -1;
}

const reservedOperators = ['=', '.', '..', '->', '--', '|', ':'];

function isReservedOperator(k: string): boolean {
  return reservedOperators.indexOf(k) !== -1;
}

export const newline = Parsimmon.string('\n');

export const spaces = Parsimmon.regex(/[\s\t]*/);

export const spaces_ = Parsimmon.regex(/[\s\t]+/);

const lower = Parsimmon.regex(/[a-z]/);

const upper = Parsimmon.regex(/[A-Z]/);

const lparen = Parsimmon.string('(');

const rparen = Parsimmon.string(')');

export const parens = (p: Parsimmon.Parser<any>) => p.wrap(lparen, rparen);

const lbrace = Parsimmon.string('{');

const rbrace = Parsimmon.string('}');

const lbracket = Parsimmon.string('[');

const rbracket = Parsimmon.string(']');

export const brackets = (p: Parsimmon.Parser<any>) =>
  p.wrap(lbracket, rbracket);

export const braces = (p: Parsimmon.Parser<any>) => p.wrap(lbrace, rbrace);

const name = (parser: Parsimmon.Parser<string>) =>
  Parsimmon.seqMap(
    parser,
    Parsimmon.regex(/[a-zA-Z0-9-_]*/),
    (parserValue: string, nameRest: string) => parserValue + nameRest
  );

export const upName = name(upper).desc('upName');

export const loName = Parsimmon.string('_')
  .or(name(lower))
  .chain((n: string) => {
    if (isReservedKeyword(n)) {
      return Parsimmon.fail(`keyword "${n}" is reserved`);
    }
    return Parsimmon.succeed(n);
  })
  .desc('loName');

export const initialSymbol = (k: string) => Parsimmon.string(k).skip(spaces_);

export const symbol = (k: string) =>
  Parsimmon.string(k)
    .trim(whitespace)
    .desc(`symbol: "${k}"`);

export const symbol_ = (k: string) =>
  Parsimmon.string(k)
    .skip(Parsimmon.regex(/(\s|\n)+/))
    .trim(whitespace)
    .desc(`symbol_: "${k}"`);

export const moduleName = Parsimmon.sepBy(upName, Parsimmon.string('.')).wrap(
  spaces,
  spaces
);

export const emptyTuple = Parsimmon.string('()');

export const operator = Parsimmon.regex(
  /[+\-\/*=.$<>:&|^?%#@~!]+|\x8As\x08/
).chain((n: string) => {
  if (isReservedOperator(n)) {
    return Parsimmon.fail(`operator "${n}" is reserved`);
  }
  return Parsimmon.succeed(n);
});

export const functionName = loName.node('functionName');

// Parser for comma-separated strings.
export const commaSeparated = (p: Parsimmon.Parser<any>) =>
  p.trim(whitespace).sepBy1(Parsimmon.string(','));

// Parser for comma-separated strings, such as Tuples, f.e.: (,,,1)
export const commaSeparated_ = (p: Parsimmon.Parser<any>) =>
  p.trim(whitespace).sepBy(Parsimmon.string(','));

export const sign: Parsimmon.Parser<number> = Parsimmon.alt(
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
