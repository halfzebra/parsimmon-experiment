import { moduleDeclaration } from './statement';

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
        moduleDeclaration.tryParse('module Main exposing (Foo(Bar), Buzz, fizz)')
      ).not.toThrow();
    });
  });
});
