import {isExpression, log, unindent} from './__tests__/util';
import { accessFunction, term } from './expression';
import { operators } from './binOp';
import { parseExpression } from './ast';

describe('expressions', () => {
  describe('letExpression', () => {
    it('should parse a single binding', () => {
      expect(isExpression('let a = 42 in a')).toBe(true);
    });

    it('should bind to _', () => {
      expect(isExpression('let _ = 42 in 24')).toBe(true);
    });

    it('can start with a tag name', () => {
      expect(isExpression('let letter = 1 \n in letter')).toBe(true);
    });

    it('can parse a function in let binding', () => {
      expect(parseExpression(operators).tryParse(unindent`
        let
          f x = x + 1
        in
          f 4`
      )).toMatchObject({ name: 'Let' })
    })
  });

  describe('case', () => {
    it.skip('simple statement', () => {
      expect(
        isExpression(unindent`
          case x of
            Nothing ->
              0
            Just y ->
              y`)
      ).toBe(true);
    });
  });

  describe('term', () => {
    it('should parse module constant access', () => {
      expect(term(operators).tryParse('Html.div')).toMatchObject({
        name: 'Access'
      });
    });

    it('should parse module type access', () => {
      expect(term(operators).tryParse('Maybe.Just')).toMatchObject({
        name: 'Variable'
      });
    });

    it('should parse acces function', () => {
      expect(term(operators).tryParse('.key')).toBe('key');
    });

    it('should parse variable identifier', () => {
      expect(term(operators).tryParse('a')).toMatchObject({
        name: 'Variable',
        value: 'a'
      });
    });

    it('should parse a string literal', () => {
      expect(term(operators).tryParse('"hello"')).toMatchObject({
        name: 'string',
        value: 'hello'
      });
    });

    it('should parse int literal', () => {
      expect(term(operators).tryParse('1')).toMatchObject({
        name: 'Integer',
        value: 1
      });
    });
  });

  describe('Access', () => {
    it('simple statement', () => {
      expect(isExpression('Module.a')).toBe(true);
    });
  });

  describe('Access Function', () => {
    it('should parse the access function', () => {
      expect(accessFunction.parse('.a').status).toBe(true);
    });
  });

  it('should parse an operator in parents', () => {
    expect(parseExpression(operators).tryParse('(+)')).toMatchObject({
      name: 'Variable',
      value: '+'
    });
  });
});
