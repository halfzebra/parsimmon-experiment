import {
  moduleDeclaration,
  portModuleDeclaration,
  effectModuleDeclaration,
  typeAliasDeclaration,
  typeDeclaration,
  infixDeclaration,
  opTable,
  functionDeclaration
} from './statement';
import { operators } from './binOp';
import { areStatements, isStatement, unindent } from './__tests__/util';
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

  describe('infixDeclaration', () => {
    it('should fail to parse the infix declaration', () => {
      expect(() => infixDeclaration.tryParse('infix 9 :-')).not.toThrow();
    });

    it('should parse the infix declaration', () => {
      expect(infixDeclaration.parse('infix 9 :-')).toMatchObject({
        status: true,
        value: ['None', { name: 'Integer', value: 9 }, ':-']
      });
    });
  });

  describe('opTable', () => {
    it('should parse infix declarations', () => {
      const ops = opTable(operators).tryParse('infix 9 :-');
      expect(ops[':-']).toMatchObject(['None', { value: 9 }]);
    });

    it('should parse infix operators in a real Elm module', () => {
      const moduleSrc = fs.readFileSync(
        path.resolve(
          __dirname,
          './__tests__/fixtures/ModuleWithInfixOperator.elm'
        ),
        'utf8'
      );

      expect(opTable(operators).tryParse(moduleSrc)['=>']).toMatchObject([
        'Left',
        { value: 9 }
      ]);
    });
  });

  describe('Type Annotations', () => {
    it('should parse the constant type anpotation', () => {
      expect(isStatement('x : Int')).toEqual(true);
    });

    it('should parse the variables type variable', () => {
      expect(isStatement('x : a')).toEqual(true);
    });

    it('should parse the variables type variable with a number', () => {
      expect(isStatement('x : a1')).toEqual(true);
    });

    it('should parse the type application', () => {
      expect(isStatement('x : a -> b')).toEqual(true);
    });

    it('should follow application associativity', () => {
      expect(isStatement('x : a -> b -> c')).toEqual(true);
    });

    it('should follow application parens', () => {
      expect(isStatement('x : (a -> b) -> c')).toEqual(true);
    });

    it('should parse qualified types', () => {
      expect(isStatement('m : Html.App Msg')).toEqual(true);
    });
  });

  describe('Function Declaration', () => {
    it('should', () => {
      expect(() =>
        functionDeclaration(operators).tryParse('f x = x')
      ).not.toThrow();
    });

    it('should parse a function declaration', () => {
      const singleDeclarationInput = unindent`
        f x =
          x + 1
        `;

      expect(areStatements(singleDeclarationInput)).toEqual(true);
    });

    it.skip('should parse a single function declaration with type annotation', () => {
      const singleDeclarationInput = unindent`
        f : Int -> Int
        f x =
          a { r | f = 1 }    c
        `;
      expect(areStatements(singleDeclarationInput)).toEqual(true);
    });
  });

  describe.skip('multiline function declarations', () => {
    it('should parse multiline function declarations', () => {
      const multipleDeclarationsInput = unindent`
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
