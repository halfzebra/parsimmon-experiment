import Parsimmon from 'parsimmon';

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
import { integer } from './expression/literal/integer';
import { Assoc, OpTable } from './binOp';
import { comment } from './statement/comment';

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

const typeVariable = Parsimmon.regex(/[a-z]+(\w|_)*/).node('typeVariable');

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
).desc('typeRecordConstructor');

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
).desc('typeParameter');

const typeConstructor = Parsimmon.lazy(() =>
  Parsimmon.seq(upName, typeParameter.many())
    .sepBy1(Parsimmon.string('.'))
    .desc('typeConstructor')
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

const typeAnnotation = Parsimmon.lazy(() => type_.sepBy(typeApplication)).node('typeApplication');

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
).desc('typeDeclaration');

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
).node('functionTypeDeclaration');

export const functionDeclaration = (ops: OpTable) =>
  Parsimmon.seq(
    Parsimmon.alt(loName, parens(operator)),
    term(ops)
      .sepBy(Parsimmon.optWhitespace)
      .trim(Parsimmon.optWhitespace),
    symbol('=')
      .then(Parsimmon.optWhitespace)
      .then(expression(ops))
  ).desc('functionDeclaration');

// Comments

type InfixDeclaration = [Assoc, number, string];

// Infix declarations
export const infixDeclaration: Parsimmon.Parser<
  InfixDeclaration
> = Parsimmon.seq(
  Parsimmon.alt(
    initialSymbol('infixl').map((): Assoc => 'L'),
    initialSymbol('infixr').map((): Assoc => 'R'),
    initialSymbol('infix').map((): Assoc => 'N')
  ),
  integer.trim(Parsimmon.optWhitespace),
  Parsimmon.optWhitespace.then(loName.or(operator))
);

// A scanner that returns an updated OpTable based on the infix declarations in the input.
const infixStatements = Parsimmon.alt(
  Parsimmon.notFollowedBy(infixDeclaration).skip(Parsimmon.any),
  infixDeclaration
)
  .trim(Parsimmon.optWhitespace)
  .many()
  .skip(Parsimmon.eof);

export const opTable = (ops: OpTable) =>
  infixStatements
    .map(x => x.filter(y => !!y))
    .map((infixStatementsList: any) => {
      if (infixStatementsList.length === 0) {
        return ops;
      }

      const [operatorDeclaration] = infixStatementsList;
      const [assoc, ord, name] = operatorDeclaration;
      return { ...ops, [name]: [assoc, ord] };
    });

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
      comment
    )
  );

export const statements = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    statement(ops)
      .trim(Parsimmon.optWhitespace)
      .many()
      .skip(Parsimmon.eof)
  );
