import { isExpression, log, unindent } from './__tests__/util';
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
      expect(
        parseExpression(operators).tryParse(unindent`
        let
          f x = x + 1
        in
          f 4`)
      ).toMatchObject({ name: 'Let' });
    });

    it('can parse multiple functions in let binding', () => {
      expect(
        parseExpression(operators).tryParse(unindent`
        let
          f x = x + 1
          g x = x + 1
        in
          f 4`)
      ).toMatchObject({ name: 'Let' });
    });

    it('can parse multiple let bindings', () => {
      expect(
        parseExpression(operators).tryParse(unindent`
        let
          a = 42
        
          b = a + 1
        in
          b`)
      ).toMatchObject({ name: 'Let' });
    });

    it('can parse destructuring in let', () => {
      expect(
        parseExpression(operators).tryParse('let (a,b) = (1,2) in a')
      ).toMatchObject({ name: 'Let' });
    });
  });

  describe('Case', () => {
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

    it('should parse the default binding to underscore', () => {
      expect(
        parseExpression(operators).tryParse(unindent`
        case x of
          _ ->
            42`)
      ).toMatchObject({ name: 'Case' });
    });

    it('should parse nested case', () => {
      expect(
        parseExpression(operators).tryParse(unindent`
        case x of
          a -> a
          b ->
            case y of
              a1 -> a1
              b1 -> b1
          c -> c`)
      ).toMatchObject({ name: 'Case' });
    });

    // TODO: fix this one, when BinOp parser is 100% functional.
    it.skip('can parse case expression with `as` keyword in pattern', () => {
      log(
        parseExpression(operators).tryParse(unindent`
        case a of
          T _ as x -> 1
      `)
      );
      expect(
        parseExpression(operators).tryParse(unindent`
        case a of
          T _ as x -> 1
      `)
      ).toMatchObject({ name: 'Case' });
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
        name: 'String',
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

  describe('lambda', () => {
    it('should parse a simple lambda', () => {
      expect(parseExpression(operators).tryParse(`\\a -> a + 1`)).toMatchObject(
        { name: 'Lambda' }
      );
    });

    it('should parse a lambda with Record destructuring', () => {
      expect(
        parseExpression(operators).tryParse(`\\{ a, b } -> a + 1`)
      ).toMatchObject({ name: 'Lambda' });
    });

    it('should parse a lambda with Tuple destructuring', () => {
      expect(
        parseExpression(operators).tryParse(`\\( a, b ) -> a + 1`)
      ).toMatchObject({ name: 'Lambda' });
    });

    it('should parse a lambda with ignored arguments', () => {
      expect(parseExpression(operators).tryParse(`\\_ -> 1`)).toMatchObject({
        name: 'Lambda'
      });
    });
  });

  describe('Access', () => {
    it('simple statement', () => {
      expect(isExpression('Module.a')).toBe(true);
    });
  });

  describe('Access Function', () => {
    it('should parse the Record access function', () => {
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
