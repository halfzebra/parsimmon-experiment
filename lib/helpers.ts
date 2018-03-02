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

export const spaces = Parsimmon.regex(/[ \\t]*/);

export const spaces_ = Parsimmon.regex(/[ \\t]+/);

const lower = Parsimmon.regex(/[a-z]/);

const upper = Parsimmon.regex(/[A-Z]/);

const lparen = Parsimmon.string('(');

const rparen = Parsimmon.string(')');

export const parens = (p: Parsimmon.Parser<any>) => p.wrap(lparen, rparen);

const name = (parser: Parsimmon.Parser<string>) =>
  Parsimmon.seqMap(
    parser,
    Parsimmon.regex(/[a-zA-Z0-9-_]*/),
    (parserValue, nameRest) => parserValue + nameRest
  );

export const upName = name(upper).desc('upName');

export const loName = Parsimmon.string('_')
  .or(name(lower))
  .chain(n => {
    if (isReservedKeyword(n)) {
      return Parsimmon.fail(`keyword "${n}" is reserved`);
    }
    return Parsimmon.succeed(n);
  }).desc('loName');

export const initialSymbol = (k: string) => Parsimmon.string(k).skip(spaces_);

export const symbol = (k: string) =>
  Parsimmon.string(k).wrap(Parsimmon.optWhitespace, Parsimmon.optWhitespace);

export const moduleName = Parsimmon.sepBy(upName, Parsimmon.string('.')).wrap(
  spaces,
  spaces
);

export const operator = Parsimmon.regex(
  /[+\\-\\/*=.$<>:&|^?%#@~!]+|\x8As\x08/
).chain(n => {
  if (isReservedOperator(n)) {
    return Parsimmon.fail(`operator "${n}" is reserved`);
  }
  return Parsimmon.succeed(n);
});

export const functionName = loName;

export const commaSeparated = (p: Parsimmon.Parser<any>) =>
  p.trim(Parsimmon.optWhitespace).sepBy1(Parsimmon.string(','));
