import Parsimmon, { Parser } from 'parsimmon';
import { dot, lbrace, rbrace } from './tokens';

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

export const whitespace = Parsimmon.regex(/[ \t\x0D\n]*/);

export const newline = Parsimmon.string('\n');

export const spaces = Parsimmon.regex(/[ \t]*/);

export const spaces1 = Parsimmon.regex(/[ \t]+/);

const lower = Parsimmon.regex(/[a-z]/);

const upper = Parsimmon.regex(/[A-Z]/);

const lparen = Parsimmon.string('(');

const rparen = Parsimmon.string(')');

const lbracket = Parsimmon.string('[');

const rbracket = Parsimmon.string(']');

const comma = Parsimmon.string(',');

export function parens<T>(p: Parser<T>): Parser<T> {
  return p.wrap(lparen, rparen);
}

export function brackets<T>(p: Parser<T>): Parser<T> {
  return p.wrap(lbracket, rbracket);
}

export function braces<T>(p: Parser<T>): Parser<T> {
  return p.wrap(lbrace, rbrace);
}

const name = (parser: Parser<string>) =>
  Parsimmon.seqMap(
    parser,
    Parsimmon.regex(/[a-zA-Z0-9-_]*/),
    (parserValue: string, nameRest: string) => parserValue + nameRest
  );

export const upName: Parsimmon.Parser<string> = name(upper).desc('upName');

export const loName: Parser<string> = Parsimmon.string('_')
  .or(
    name(lower).chain(
      (n: string) =>
        isReservedKeyword(n)
          ? Parsimmon.fail(`keyword "${n}" is reserved`)
          : Parsimmon.succeed(n)
    )
  )
  .desc('loName');

export const initialSymbol = (k: string) => Parsimmon.string(k).skip(spaces1);

export const symbol = (k: string) =>
  Parsimmon.string(k)
    .trim(whitespace)
    .desc(`symbol: "${k}"`);

export const symbol_ = (k: string) =>
  Parsimmon.string(k)
    .skip(Parsimmon.regex(/[ \n]+/))
    .trim(whitespace)
    .desc(`symbol_: "${k}"`);

export const moduleName = Parsimmon.sepBy(upName, dot).trim(spaces);

export const operator = Parsimmon.regex(/[+\-\/*=.$<>:&|^?%#@~!]+|\x8As\x08/)
  .chain((n: string) => {
    if (isReservedOperator(n)) {
      return Parsimmon.fail(`operator "${n}" is reserved`);
    }
    return Parsimmon.succeed(n);
  })
  .desc('operator');

export const functionName = loName.node('FunctionName');

export function commaSeparated<T>(p: Parser<T>) {
  return p.trim(whitespace).sepBy(comma);
}

export const commaSeparated1 = (p: Parser<any>) =>
  p.trim(whitespace).sepBy1(comma);

export const commaSeparated2 = (p: Parser<any>) =>
  sepBy2(p.trim(whitespace), comma);

export function sepBy2<A, B>(
  parser: Parser<A>,
  separator: Parser<B>
): Parser<A[]> {
  const pairs = separator.then(parser).many();
  return Parsimmon.seqMap(
    parser.skip(separator),
    parser,
    pairs,
    (first, second, rest) => {
      return [first, second, ...rest];
    }
  );
}

export const sign: Parser<number> = Parsimmon.alt(
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

export const emptyTuple = parens(spaces)
  .desc('emptyTuple')
  .node('Tuple');

export const countIndent = whitespace.map(
  value => value.split('').filter(str => str === ' ').length
);

// https://github.com/elm-community/parser-combinators/blob/master/src/Combine.elm#L1055
export function chainl<T>(
  op: Parser<(a: T, b: T) => T>,
  p: Parser<T>
): Parser<T> {
  const accumulate = (x: T): Parser<T> =>
    op.chain(f => p.chain(y => accumulate(f(x, y)))).or(Parsimmon.succeed(x));

  return p.chain(accumulate);
}

export function withColumn<T>(
  fn: (value: number) => Parsimmon.Parser<T>
): Parsimmon.Parser<T> {
  return Parsimmon.index.map(({ column }) => column).chain(fn);
}
