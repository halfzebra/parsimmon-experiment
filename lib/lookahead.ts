import Parsimmon, {Parser} from "parsimmon";
import {log} from "./__tests__/util";

export function lookahead<T>(x: Parser<T>):Parser<T> {
  return Parsimmon((input, i) => {
    const result = x._(input, i);
    log(result);
    result.index = i;
    return result;
  });
}
