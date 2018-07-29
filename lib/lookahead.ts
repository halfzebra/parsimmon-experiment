import Parsimmon, { Parser } from 'parsimmon';

export function lookahead<T>(x: Parser<T>): Parser<T> {
  return Parsimmon((input, i) => {
    const result = x._(input, i);
    result.index = i;
    return result;
  });
}
