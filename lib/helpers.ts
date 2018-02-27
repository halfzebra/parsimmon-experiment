import {string, regex, seqMap, fail, succeed} from 'parsimmon';

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

function isReserved(k) {
  return reserved.indexOf(k) !== -1;
}

const lower = regex(/[a-z]/);

const upper = regex(/[A-Z]/);

const name = parser =>
  seqMap(
    parser,
    regex(/[a-zA-Z0-9-_]*/),
    (parserValue, nameRest) => parserValue + nameRest
  );


export const upName = name(upper);

export const loName = string('_')
  .or(name(lower))
  .chain(n => {
    if (isReserved(n)) {
      return fail('Reserved keyword')
    }
    return succeed(n)
  });
