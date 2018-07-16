import * as Parsimmon from 'parsimmon';
import { loName, operator, parens, upName } from '../helpers';
import { emptyTuple } from '../helpers';

export const variable = Parsimmon.alt(
  loName,
  upName.sepBy1(Parsimmon.string('.')),
  parens(operator),
  parens(Parsimmon.regex(/,+/)),
  emptyTuple
).node('Variable');
