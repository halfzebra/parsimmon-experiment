import { Index, Parser } from 'parsimmon';

// TODO: send a PR to https://github.com/DefinitelyTyped/DefinitelyTyped/

declare module 'parsimmon' {
  interface Parser<T> {
    wrap(left: Parser<any>, right: Parser<any>): Parser<any>;

    sepBy1(separator: Parser<any>): Parser<T>;

    sepBy(separator: Parser<any>): Parser<T>;

    node(name?: string): Parser<Index>;

    tie(): Parser<string>;

    chain(): Parser<string>
  }
}
