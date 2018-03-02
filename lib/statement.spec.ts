import { moduleDeclaration, importStatement } from './statement';

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
});
