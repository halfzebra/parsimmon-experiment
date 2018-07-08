import * as Parsimmon from 'parsimmon';
import { sign } from '../../helpers';

export const float = Parsimmon.seqMap(
  sign,
  Parsimmon.regex(/(0|[1-9][0-9]*)(\.[0-9]+)/).map(parseFloat),
  (parsedSign: number = 1, parsed: number) => parsedSign * parsed
);
