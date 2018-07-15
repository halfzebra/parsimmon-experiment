import Parsimmon, { Index } from 'parsimmon';

import {
  initialSymbol,
  moduleName,
  symbol,
  parens,
  operator,
  commaSeparated,
  commaSeparated_,
  loName,
  upName,
  spaces,
  braces,
  spaces1,
  newline,
  whitespace
} from './helpers';
import { expression, term } from './expression';
import { integer } from './expression/literal/integer';
import { Assoc, OpTable } from './binOp';
import { comment } from './statement/comment';
import { moduleExports } from './statement/moduleExports';
import { importStatement } from './statement/import';

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

// Type declarations.

const typeVariable = Parsimmon.regex(/[a-z]+(\w|_)*/).node('typeVariable');

const typeConstant = upName.sepBy1(Parsimmon.string('.'));

const typeTuple = Parsimmon.lazy(() => parens(commaSeparated_(type_)));

const typeRecordPair = Parsimmon.lazy(() =>
  Parsimmon.seq(loName.skip(symbol(':')), typeAnnotation)
);

const typeRecordPairs = Parsimmon.lazy(() => commaSeparated_(typeRecordPair));

const typeRecordConstructor = Parsimmon.lazy(() =>
  braces(
    Parsimmon.seq(typeVariable.trim(spaces), symbol('|').then(typeRecordPairs))
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
  ).trim(spaces.then(newline.then(spaces1)).or(spaces))
).desc('typeParameter');

const typeConstructor = Parsimmon.lazy(() =>
  Parsimmon.seq(upName, typeParameter.many())
    .sepBy1(Parsimmon.string('.'))
    .desc('typeConstructor')
);

const typeApplication = symbol('->').desc('typeApplication');

const typeAnnotation = Parsimmon.lazy(() => type_.sepBy(typeApplication))
  .node('typeApplication')
  .desc('typeAnnotation');

const type_: Parsimmon.Parser<string> = Parsimmon.lazy(() =>
  Parsimmon.alt(
    typeConstructor,
    typeVariable,
    typeRecordConstructor,
    typeRecord,
    typeTuple,
    parens(typeAnnotation)
  ).trim(spaces)
);

// Type declarations.

export const typeAliasDeclaration = Parsimmon.lazy(() =>
  Parsimmon.seq(
    initialSymbol('type').then(symbol('alias').then(type_)),
    whitespace.then(symbol('=').then(typeAnnotation))
  )
).desc('typeAliasDeclaration');

export const typeDeclaration = Parsimmon.seq(
  initialSymbol('type').then(type_),
  whitespace.then(
    symbol('=').then(typeConstructor.trim(whitespace).sepBy1(symbol('|')))
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
    loName.trim(spaces).many(),
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
    term(ops).trim(whitespace),
    symbol('=')
      .then(whitespace)
      .then(expression(ops))
  );

// Comments

type InfixDeclaration = [Assoc, Index, string];

// Infix declarations
export const infixDeclaration: Parsimmon.Parser<
  InfixDeclaration
> = Parsimmon.seq(
  Parsimmon.alt(
    initialSymbol('infixl').map((): Assoc => 'Left'),
    initialSymbol('infixr').map((): Assoc => 'Right'),
    initialSymbol('infix').map((): Assoc => 'None')
  ),
  spaces.then(integer),
  spaces.then(loName.or(operator))
);

// A scanner that returns an updated OpTable based on the infix declarations in the input.
const infixStatements = Parsimmon.alt(
  Parsimmon.notFollowedBy(infixDeclaration).skip(Parsimmon.any),
  infixDeclaration
)
  .skip(whitespace)
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
  ).desc('statement');

export const statements = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    statement(ops)
      .trim(whitespace)
      .many()
      .skip(Parsimmon.eof)
  );
