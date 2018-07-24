import Parsimmon from 'parsimmon';
import {
  commaSeparated1,
  functionName,
  operator,
  parens,
  symbol,
  upName,
  whitespace
} from '../helpers';

const allExport = symbol('..');

const functionExport = Parsimmon.alt(functionName, parens(operator));

const constructorSubsetExports = commaSeparated1(upName);

const constructorExports = parens(
  allExport.or(constructorSubsetExports)
).fallback('Nothing');

const typeExport = Parsimmon.seq(upName.skip(whitespace), constructorExports);

const subsetExport = commaSeparated1(Parsimmon.alt(functionExport, typeExport));

export const moduleExports = parens(Parsimmon.alt(allExport, subsetExport));
