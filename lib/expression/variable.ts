import { alt, regex } from 'parsimmon';
import { loName, operator, parens, upName } from '../helpers';
import { emptyTuple } from '../helpers';
import { dot } from '../tokens';

const commas = regex(/,+/);

const typleConstructor = parens(commas);
const infixOperatorInPrefixNotation = parens(operator);

export const variable = alt(
  loName,
  upName.sepBy1(dot),
  infixOperatorInPrefixNotation,
  typleConstructor,
  emptyTuple
).node('Variable');
