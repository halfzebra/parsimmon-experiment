import * as Parsimmon from 'parsimmon';

import {
  initialSymbol,
  moduleName,
  symbol,
  parens,
  operator,
  functionName,
  commaSeparated,
  upName,
  spaces
} from './helpers';

const allExport = symbol('..');

const functionExport = Parsimmon.alt(functionName, parens(operator));

const constructorSubsetExports = commaSeparated(upName);

const constructorExports = parens(
  allExport.or(constructorSubsetExports)
).fallback('Nothing'); // FIXME: custom data-structure?

const typeExport = Parsimmon.seq(
  upName.trim(Parsimmon.optWhitespace),
  constructorExports
);

const subsetExport = commaSeparated(Parsimmon.alt(functionExport, typeExport));

const moduleExports = parens(Parsimmon.alt(allExport, subsetExport));

// Module.

export const moduleDeclaration = Parsimmon.seq(
  initialSymbol('module').then(moduleName),
  symbol('exposing').then(moduleExports)
);

// Import.

export const importStatement = Parsimmon.seq(
  initialSymbol('import').then(moduleName),
  symbol('as')
    .then(upName)
    .fallback('Nothing'),
  symbol('exposing')
    .then(moduleExports)
    .fallback('Nothing')
);

export const statement = Parsimmon.alt(moduleDeclaration, importStatement);
