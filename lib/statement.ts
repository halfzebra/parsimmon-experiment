import Parsimmon from 'parsimmon';

import {
  initialSymbol,
  moduleName,
  symbol,
  parens,
  operator,
  commaSeparated1,
  commaSeparated,
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
import { Associativity, OperatorTable } from './binOp';
import { comment } from './statement/comment';
import { moduleExports } from './statement/moduleExports';
import { importStatement } from './statement/import';
import { dot } from './tokens';

// Module.

export const moduleDeclaration = Parsimmon.seq(
  initialSymbol('module').then(moduleName.node('ModuleName')),
  symbol('exposing').then(moduleExports)
).node('ModuleDeclaration');

export const portModuleDeclaration = Parsimmon.seq(
  initialSymbol('port').then(symbol('module').then(moduleName)),
  symbol('exposing').then(moduleExports)
).node('PortModuleDeclaration');

export const effectModuleDeclaration = Parsimmon.seq(
  initialSymbol('effect').then(symbol('module').then(moduleName)),
  symbol('where').then(
    braces(commaSeparated1(Parsimmon.seq(loName, symbol('=').then(upName))))
  ),
  symbol('exposing').then(moduleExports)
).node('EffectModuleDeclaration');

// Type declarations.

const typeVariable = Parsimmon.regex(/[a-z]+(\w|_)*/).node('TypeVariable');

const typeConstant = upName.sepBy1(dot);

const typeTuple = Parsimmon.lazy(() => parens(commaSeparated(type_)));

const typeRecordPair = Parsimmon.lazy(() =>
  Parsimmon.seq(loName.skip(symbol(':')), typeAnnotation)
);

const typeRecordPairs = Parsimmon.lazy(() => commaSeparated(typeRecordPair));

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
    .sepBy1(dot)
    .desc('typeConstructor')
);

const typeApplication = symbol('->').desc('typeApplication');

const typeAnnotation = Parsimmon.lazy(() => type_.sepBy(typeApplication))
  .node('TypeApplication')
  .desc('TypeAnnotation');

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

const portDeclaration = (ops: OperatorTable) =>
  Parsimmon.seq(
    initialSymbol('port').then(loName),
    loName.trim(spaces).many(),
    symbol('=').then(expression(ops))
  );

// Functions.
const functionTypeDeclaration = Parsimmon.seq(
  Parsimmon.alt(loName, parens(operator)).skip(symbol(':')),
  typeAnnotation
).node('FunctionTypeDeclaration');

export const functionDeclaration = (ops: OperatorTable) =>
  Parsimmon.seq(
    Parsimmon.alt(loName, parens(operator)),
    term(ops).trim(whitespace),
    symbol('=')
      .then(whitespace)
      .then(expression(ops))
  );

// Infix declarations
export const infixDeclaration = Parsimmon.seq(
  Parsimmon.alt(
    initialSymbol('infixl').map((): Associativity => 'Left'),
    initialSymbol('infixr').map((): Associativity => 'Right'),
    initialSymbol('infix').map((): Associativity => 'None')
  ),
  spaces.then(integer),
  spaces.then(loName.or(operator))
);

// A scanner that returns an updated OperatorTable based on the infix declarations in the input.
const infixStatements = Parsimmon.alt(
  Parsimmon.notFollowedBy(infixDeclaration).skip(Parsimmon.any),
  infixDeclaration
)
  .skip(whitespace)
  .many()
  .skip(Parsimmon.eof);

export const opTable = (ops: OperatorTable) =>
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

export const statement = (ops: OperatorTable) =>
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

export const statements = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    statement(ops)
      .trim(whitespace)
      .many()
      .skip(Parsimmon.eof)
  );
