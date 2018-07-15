import Parsimmon from 'parsimmon';
import {
  commaSeparated,
  functionName,
  operator,
  parens,
  symbol,
  upName,
  whitespace
} from '../helpers';

const allExport = symbol('..');

const functionExport = Parsimmon.alt(functionName, parens(operator));

const constructorSubsetExports = commaSeparated(upName);

const constructorExports = parens(
  allExport.or(constructorSubsetExports)
).fallback('Nothing');

const typeExport = Parsimmon.seq(upName.skip(whitespace), constructorExports);

const subsetExport = commaSeparated(Parsimmon.alt(functionExport, typeExport));

export const moduleExports = parens(Parsimmon.alt(allExport, subsetExport));
