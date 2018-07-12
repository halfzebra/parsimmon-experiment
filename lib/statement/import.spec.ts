import { importStatement } from './import';

describe('Import Statement', () => {
  it('should parse simple import', () => {
    expect(() => importStatement.tryParse('import A')).not.toThrow();
  });

  it('should parse import `as`', () => {
    expect(() => importStatement.tryParse('import A as B')).not.toThrow();
  });

  it('should parse import exposing all', () => {
    expect(() =>
      importStatement.tryParse('import A exposing (..)')
    ).not.toThrow();
  });

  it('should parse import exposing', () => {
    expect(() =>
      importStatement.tryParse('import A exposing (A, b)')
    ).not.toThrow();
  });

  it('should parse import exposing union', () => {
    expect(() =>
      importStatement.tryParse('import A exposing (A(..))')
    ).not.toThrow();
  });

  it('should parse import exposing constructor subset', () => {
    expect(() =>
      importStatement.tryParse('import A exposing (A(A))')
    ).not.toThrow();
  });

  it('should parse import multiline', () => {
    expect(() =>
      importStatement.tryParse('import A as B exposing (A, B,\nc)')
    ).not.toThrow();
  });

  it('should fail if list of exports is missing', () => {
    expect(() =>
      importStatement.tryParse('import Maybe exposing ()')
    ).toThrow();
  });

  it('should fail if list of exports are not specified', () => {
    expect(() => importStatement.tryParse('import Maybe exposing')).toThrow();
  });
});
