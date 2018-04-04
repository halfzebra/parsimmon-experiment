import {
  moduleDeclaration,
  portModuleDeclaration,
  importStatement,
  effectModuleDeclaration,
  typeAliasDeclaration,
  typeDeclaration,
  comment,
  infixDeclaration,
  opTable,
  functionDeclaration
} from '../statement';
import { operators } from '../binOp';
import { areStatements } from './util';
import fs from 'fs';
import path from 'path';

describe('statement', () => {
  describe('moduleDeclaration', () => {
    it('should parse a module declaration', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (..)')
      ).not.toThrow();
    });

    it('should parse a module with one function export', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (main)')
      ).not.toThrow();
    });

    it('should parse a module declaration with multiple function exports', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (main, add, hello)')
      ).not.toThrow();
    });

    it('should parse a module declaration with type export', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (Foo)')
      ).not.toThrow();
    });

    it('should parse a module declaration with type export', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (Foo)')
      ).not.toThrow();
    });

    it('should parse a module declaration with constructor export that exposes the whole set', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (Foo(..))')
      ).not.toThrow();
    });

    it('should parse a module declaration with constructor export that exposes only the subset', () => {
      expect(() =>
        moduleDeclaration.tryParse('module Main exposing (Foo(Bar))')
      ).not.toThrow();
    });

    it('should parse a module with mixed exports', () => {
      expect(() =>
        moduleDeclaration.tryParse(
          'module Main exposing (Foo(Bar), Buzz, fizz)'
        )
      ).not.toThrow();
    });

    it('should parse a namespaced module declaration', () => {
      expect(() =>
        moduleDeclaration.tryParse('module App.View exposing (..)')
      ).not.toThrow();
    });
  });

  describe('portModuleDeclaration', () => {
    it('should parse a port module with constructor all export', () => {
      expect(() =>
        portModuleDeclaration.tryParse('port module A exposing (A(..))')
      ).not.toThrow();
    });
  });

  describe('effectModuleDeclaration', () => {
    it('should parse effect module declaration with all export', () => {
      expect(() =>
        effectModuleDeclaration.tryParse(
          'effect module A where {subscription = MySub, command = MyCmd} exposing (..)'
        )
      ).not.toThrow();
    });
  });

  describe('importStatement', () => {
    it('should parse module import', () => {
      expect(() => importStatement.tryParse('import Html')).not.toThrow();
    });

    it('should parse namespaced module import', () => {
      expect(() =>
        importStatement.tryParse('import Json.Decode')
      ).not.toThrow();
    });

    it('should parse aliased module import', () => {
      expect(() =>
        importStatement.tryParse('import Json.Decode as Json')
      ).not.toThrow();
    });

    it('should parse module import with all export', () => {
      expect(() =>
        importStatement.tryParse('import Json.Decode exposing (..)')
      ).not.toThrow();
    });

    it('should parse module import with function export', () => {
      expect(() =>
        importStatement.tryParse('import Json.Decode exposing (map2)')
      ).not.toThrow();
    });

    it('should parse module import with type export', () => {
      expect(() =>
        importStatement.tryParse('import Json.Decode exposing (Value)')
      ).not.toThrow();
    });

    it('should parse module import with complete set of constructor export', () => {
      expect(() =>
        importStatement.tryParse('import Maybe exposing (Maybe(..))')
      ).not.toThrow();
    });

    it('should parse module import with subset of constructor export', () => {
      expect(() =>
        importStatement.tryParse('import Maybe exposing (Maybe(Nothing))')
      ).not.toThrow();
    });

    it('should fail if list of exports is missing', () => {
      expect(() => importStatement.tryParse('import Maybe exposing')).toThrow();
    });

    it('should fail if list of exports are not specified', () => {
      expect(() => importStatement.tryParse('import Maybe exposing')).toThrow();
    });

    it('should fail if list of exports are not specified', () => {
      expect(() =>
        importStatement.tryParse('import Maybe exposing ()')
      ).toThrow();
    });
  });

  describe('typeAliasDeclaration', () => {
    it('should parse a empty Record type alias', () => {
      expect(() =>
        typeAliasDeclaration.tryParse('type alias A = {}')
      ).not.toThrow();
    });

    it('should parse a empty Tuple type alias', () => {
      expect(() =>
        typeAliasDeclaration.tryParse('type alias A = ()')
      ).not.toThrow();
    });
  });

  describe('typeDeclaration', () => {
    it('should parse a simple type declaration', () => {
      expect(() => typeDeclaration.tryParse('type Foo = Bar')).not.toThrow();
    });
  });

  describe('comment', () => {
    it('shoudl parse single-line comment', () => {
      expect(() => comment.tryParse(`-- hello`)).not.toThrow();
    });

    it('shoudl parse multi-line comment with one line', () => {
      expect(() => comment.tryParse(`{- hello -}`)).not.toThrow();
    });

    it('shoudl parse  multi-line comment with multiple lines', () => {
      expect(() =>
        comment.tryParse(`{- hello
       -}`)
      ).not.toThrow();
    });

    it('shoudl parse  multi-line comment with multiple lines', () => {
      expect(() => comment.tryParse(`{- hello {- world -} -}`)).not.toThrow();
    });
  });

  describe('infixDeclaration', () => {
    it('should fail to parse the infix declaration', () => {
      expect(() => infixDeclaration.tryParse('infix 9 :-')).not.toThrow();
    });

    it('should parse the infix declaration', () => {
      expect(infixDeclaration.parse('infix 9 :-')).toEqual({
        status: true,
        value: ['N', 9, ':-']
      });
    });
  });

  describe('functionDeclaration', () => {
    it('should not fail while parsing a simple function declaration', () => {
      expect(() =>
        functionDeclaration(operators).tryParse('f x = 1')
      ).not.toThrow();
    });
  });

  describe('opTable', () => {
    it('should parse infix declarations', () => {
      const ops = opTable(operators).tryParse('infix 9 :-');
      expect(ops[':-']).toEqual(['N', 9]);
    });

    it('should parse infix operators in a real Elm module', () => {
      const moduleSrc = fs.readFileSync(
        path.resolve(__dirname, './fixtures/ModuleWithInfixOperator.elm'),
        'utf8'
      );

      expect(opTable(operators).tryParse(moduleSrc)['=>']).toEqual(['L', 9]);
    });
  });

  describe.skip('single function declaration', () => {
    it('should parse a single function declaration', () => {
      const singleDeclarationInput = `
f : Int -> Int
f x =
  a { r | f = 1 }    c
`;
      expect(areStatements(singleDeclarationInput)).toEqual(true);
    });
  });

  describe.skip('multiline function declarations', () => {
    it('should parse multiline function declarations', () => {
      const multipleDeclarationsInput = `
        
f : Int -> Int
f x =
  x + 1
g : Int -> Int
g x =
  f x + 1
h : (Int, Int) -> Int
h (a, b) = a + b
(+) : Int -> Int
(+) a b =
  1`;
      expect(areStatements(multipleDeclarationsInput)).toEqual(false);
    });
  });
});
