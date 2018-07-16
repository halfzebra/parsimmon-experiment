import * as Parsimmon from 'parsimmon';
import { sign } from '../../helpers';

const int = Parsimmon.seqMap(
  sign,
  Parsimmon.regex(/(0|[1-9][0-9]*)/).map(x => parseInt(x, 10)),
  (parsedSign: number = 1, parsed: number) => parsedSign * parsed
);

export const integer = int.node('Integer').desc('Integer');
