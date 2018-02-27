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

const spaces = Parsimmon.regex(/[ \\t]*/);

const spaces_ = Parsimmon.regex(/[ \\t]+/);

function isReserved(k) {
  return reserved.indexOf(k) !== -1;
}

const lower = Parsimmon.regex(/[a-z]/);

const upper = Parsimmon.regex(/[A-Z]/);

const name = parser =>
  Parsimmon.seqMap(
    parser,
    Parsimmon.regex(/[a-zA-Z0-9-_]*/),
    (parserValue, nameRest) => parserValue + nameRest
  );

export const upName = name(upper);

export const loName = Parsimmon.string('_')
  .or(name(lower))
  .chain(n => {
    if (isReserved(n)) {
      return Parsimmon.fail('Reserved keyword');
    }
    return Parsimmon.succeed(n);
  });

export const moduleName = Parsimmon.sepBy(upName, Parsimmon.string('.'));
