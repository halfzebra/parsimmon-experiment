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
import { expression, term } from './expression';
import { OpTable } from './binOp';

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

const typeConstructor = Parsimmon.lazy(() =>
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

// Ports.
const portTypeDeclaration = Parsimmon.seq(
  initialSymbol('port').then(loName),
  symbol(':').then(typeAnnotation)
);

const portDeclaration = (ops: OpTable) =>
  Parsimmon.seq(
    initialSymbol('port').then(loName),
    loName.wrap(spaces, spaces).many(),
    symbol('=').then(expression(ops))
  );

// Functions.
const functionTypeDeclaration = Parsimmon.seq(
  Parsimmon.alt(loName, parens(operator)).skip(symbol(':')),
  typeAnnotation
);

const functionDeclaration = (ops: OpTable) =>
  Parsimmon.seq(
    Parsimmon.alt(loName, parens(operator)),
    term(ops)
      .trim(Parsimmon.optWhitespace)
      .many(),
    symbol('=')
      .then(Parsimmon.optWhitespace)
      .then(expression(ops))
  );

// Infix declarations
const infixDeclaration = Parsimmon.seq(
  Parsimmon.alt(
    initialSymbol('infixl').map(() => 'L'),
    initialSymbol('infixr').map(() => 'R'),
    initialSymbol('infix').map(() => 'N')
  ),
  Parsimmon.optWhitespace.then(loName.or(operator))
);

export const statement = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    Parsimmon.alt(
      portModuleDeclaration,
      effectModuleDeclaration,
      moduleDeclaration,
      importStatement,
      typeAliasDeclaration,
      typeDeclaration,
      portTypeDeclaration,
      portDeclaration(ops),
      functionTypeDeclaration,
      functionDeclaration(ops),
      infixDeclaration,
    )
  );
