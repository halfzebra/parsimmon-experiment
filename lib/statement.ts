import * as Parsimmon from 'parsimmon';

import {
  initialSymbol,
  moduleName,
  symbol,
  parens,
  operator,
  functionName,
  commaSeparated,
  commaSeparated_,
  loName,
  upName,
  spaces,
  braces,
  spaces_,
  newline
} from './helpers';

const allExport = symbol('..');

const functionExport = Parsimmon.alt(functionName, parens(operator));

const constructorSubsetExports = commaSeparated(upName);

const constructorExports = parens(
  allExport.or(constructorSubsetExports)
).fallback('Nothing');

const typeExport = Parsimmon.seq(
  upName.trim(Parsimmon.optWhitespace),
  constructorExports
);

const subsetExport = commaSeparated(Parsimmon.alt(functionExport, typeExport));

const moduleExports = parens(Parsimmon.alt(allExport, subsetExport));

// Module.

export const moduleDeclaration = Parsimmon.seq(
  initialSymbol('module').then(moduleName.node('moduleName')),
  symbol('exposing').then(moduleExports)
).node('moduleDeclaration');

export const portModuleDeclaration = Parsimmon.seq(
  initialSymbol('port').then(symbol('module').then(moduleName)),
  symbol('exposing').then(moduleExports)
).node('portModuleDeclaration');

export const effectModuleDeclaration = Parsimmon.seq(
  initialSymbol('effect').then(symbol('module').then(moduleName)),
  symbol('where').then(
    braces(commaSeparated(Parsimmon.seq(loName, symbol('=').then(upName))))
  ),
  symbol('exposing').then(moduleExports)
).node('effectModuleDeclaration');

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

// Type declarations.

const typeVariable = Parsimmon.regex(/[a-z]+(\\w|_)*/);

const typeConstant = upName.sepBy1(Parsimmon.string('.'));

const typeApplication = symbol('->');

const typeTuple = Parsimmon.lazy(() => parens(commaSeparated_(type_)));

const typeRecordPair = Parsimmon.lazy(() =>
  Parsimmon.seq(loName.skip(symbol(':')), typeAnnotation)
);

const typeRecordPairs = Parsimmon.lazy(() => commaSeparated_(typeRecordPair));

const typeRecordConstructor = Parsimmon.lazy(() =>
  braces(
    Parsimmon.seq(
      typeVariable.wrap(spaces, spaces),
      symbol('|').then(typeRecordPairs)
    )
  )
);

const typeRecord = Parsimmon.lazy(() => braces(typeRecordPairs));

const typeParameter = Parsimmon.lazy(() =>
  Parsimmon.alt(
    typeVariable,
    typeConstant,
    typeRecordConstructor,
    typeRecord,
    typeTuple,
    parens(typeAnnotation)
  ).wrap(
    spaces.then(newline.then(spaces_).or(spaces)),
    spaces.then(newline.then(spaces_).or(spaces))
  )
);

const typeConstructor: Parsimmon.Parser<string> = Parsimmon.lazy(() =>
  Parsimmon.seq(upName, typeParameter.many()).sepBy1(Parsimmon.string('.'))
);

const type_: Parsimmon.Parser<string> = Parsimmon.lazy(() =>
  Parsimmon.alt(
    typeConstructor,
    typeVariable,
    typeRecordConstructor,
    typeRecord,
    typeTuple,
    parens(typeAnnotation)
  ).wrap(spaces, spaces)
);

const typeAnnotation = Parsimmon.lazy(() => type_.sepBy(typeApplication));

// Type declarations.

export const typeAliasDeclaration = Parsimmon.lazy(() =>
  Parsimmon.seq(
    initialSymbol('type').then(symbol('alias').then(type_)),
    Parsimmon.optWhitespace.then(symbol('=').then(typeAnnotation))
  )
).desc('typeAliasDeclaration');

export const typeDeclaration = Parsimmon.seq(
  initialSymbol('type').then(type_),
  Parsimmon.optWhitespace.then(
    symbol('=').then(
      typeConstructor.trim(Parsimmon.optWhitespace).sepBy1(symbol('|'))
    )
  )
);

export const statement = Parsimmon.lazy(() =>
  Parsimmon.alt(
    moduleDeclaration,
    portModuleDeclaration,
    effectModuleDeclaration,
    importStatement,
    typeAliasDeclaration,
    typeDeclaration
  )
);
