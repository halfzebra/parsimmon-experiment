import { alt, regex, string } from 'parsimmon';
import { loName, operator, parens, upName } from '../helpers';
import { emptyTuple } from '../helpers';

const dot = string('.');

const commas = regex(/,+/);

export const variable = alt(
  loName,
  upName.sepBy1(dot),
  parens(operator),
  parens(commas),
  emptyTuple
).node('Variable');
