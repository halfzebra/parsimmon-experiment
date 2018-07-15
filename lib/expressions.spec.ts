import { isExpression, unindent } from './__tests__/util';
import { accessFunction, term } from './expression';
import { operators } from './binOp';

describe('expressions', () => {
  describe('letExpression', () => {
    it.skip('should parse a single binding', () => {
      expect(isExpression('let a = 42 in a')).toBe(true);
    });

    it.skip('should bind to _', () => {
      expect(isExpression('let _ = 42 in 24')).toBe(true);
    });

    it.skip('can start with a tag name', () => {
      expect(isExpression('let letter = 1 \n in letter')).toBe(true);
    });
  });

  describe.skip('case', () => {
    it('simple statement', () => {
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
    it.skip('should parse module constant access', () => {
      expect(term(operators).tryParse('Html.div')).toMatchObject({
        name: 'access'
      });
    });

    it('should parse module type access', () => {
      expect(term(operators).tryParse('Maybe.Just')).toMatchObject({
        name: 'variable'
      });
    });

    it('should parse acces function', () => {
      expect(term(operators).tryParse('.key')).toBe('key');
    });

    it('should parse variable identifier', () => {
      expect(term(operators).tryParse('a')).toMatchObject({
        name: 'variable',
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
        name: 'integer',
        value: 1
      });
    });

    // console.dir(JSON.stringify(term(operators).tryParse('Html.div'), null, 4));
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
});
