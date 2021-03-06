import {
  loName,
  moduleName,
  upName,
  initialSymbol,
  operator,
  symbol,
  symbol_,
  countIndent,
  commaSeparated,
  parens,
  chainl,
  whitespace,
  exactIndentation
} from './helpers';
import { integer } from './expression/literal/integer';
import Parsimmon, { Parser } from 'parsimmon';

describe('helpers', () => {
  describe('upName', () => {
    it('should parse a name with first capital letter', () => {
      expect(upName.tryParse('Foo')).toBe('Foo');
    });
    it('should fail to parse a name that starts with a lower-case letter', () => {
      expect(() => upName.tryParse('foo')).toThrow();
    });
    it('should fail to parse a name that starts with a number', () => {
      expect(() => upName.tryParse('1foo')).toThrow();
    });
  });

  describe('loName', () => {
    it('should parse a name with first lowercase letter', () => {
      expect(loName.tryParse('a')).toBe('a');
    });

    it('should fail if the name is a reserved keyword', () => {
      expect(() => loName.tryParse('let')).toThrow();
    });

    it('should parse the underscore', () => {
      expect(loName.tryParse('_')).toBe('_');
    });
  });

  describe('moduleName', () => {
    it('should parse simple module name', () => {
      expect(moduleName.tryParse('Main')).toEqual(['Main']);
    });

    it('should parse a namespaced module name', () => {
      expect(moduleName.tryParse('App.View')).toEqual(['App', 'View']);
    });

    it('should parse a module name, surrounded by whitespace', () => {
      expect(moduleName.tryParse('  App.View  ')).toEqual(['App', 'View']);
    });
  });

  describe('initialSymbol', () => {
    it('should parse the initial symbol with trailing whitespace', () => {
      expect(initialSymbol('module').tryParse('module ')).toBe('module');
    });

    it('should fail if trailing whitespace is missing', () => {
      expect(() => initialSymbol('module').tryParse('module')).toThrow();
    });
  });

  describe('operator', () => {
    it('should parse the built-in operator', () => {
      expect(operator.tryParse('+')).toBe('+');
    });

    it('should parse the valid operator', () => {
      expect(operator.tryParse('=>')).toBe('=>');
    });

    it('should fail to parse the reverved operator', () => {
      expect(() => operator.tryParse('=')).toThrow();
    });
  });

  describe('symbol', () => {
    it('should parse a symbol', () => {
      expect(() => symbol('foo').tryParse('foo')).not.toThrow();
      expect(symbol('foo').tryParse('foo')).toBe('foo');
    });

    it('should parse a symbol surrounded by whitespace', () => {
      expect(() => symbol('foo').tryParse('  foo  ')).not.toThrow();
      expect(symbol('foo').tryParse('foo')).toBe('foo');
    });
  });

  describe('symbol_', () => {
    it('should parse a symbol with mandatory trailing whitespace', () => {
      expect(() => symbol_('foo').tryParse('foo ')).not.toThrow();
      expect(symbol_('foo').tryParse('foo ')).toBe('foo');
    });

    it('should parse a symbol surrounded by whitespace', () => {
      expect(() => symbol_('foo').tryParse('  foo  ')).not.toThrow();
      expect(symbol_('foo').tryParse('foo ')).toBe('foo');
    });

    it('should parse a symbol surrounded by whitespace and line-break', () => {
      expect(() =>
        symbol_('foo').tryParse(`
      foo
        `)
      ).not.toThrow();
      expect(
        symbol_('foo').tryParse(`
      foo
        `)
      ).toBe('foo');
    });
  });

  describe('countIndent', () => {
    it('should parse empty string', () => {
      expect(countIndent.tryParse('')).toBe(0);
    });

    it('should parse one space', () => {
      expect(countIndent.tryParse(' ')).toBe(1);
    });

    it('should cont tabs', () => {
      expect(countIndent.tryParse('\t')).toBe(0);
    });

    it('should count ', () => {
      expect(countIndent.tryParse(' \n\t')).toBe(1);
    });
  });

  describe('commaSeparated', () => {
    it('should parse values separated by single comma', () => {
      expect(() => commaSeparated(integer).tryParse('1,2,3')).not.toThrow();
    });

    it('should not fail on nothing', () => {
      expect(() => commaSeparated(integer).tryParse('')).not.toThrow();
    });
  });

  describe('parens', () => {
    it('should parse a value inside parens', () => {
      expect(() => parens(integer).tryParse('(1)')).not.toThrow();
    });
  });

  describe('chainl', () => {
    const int = integer.map(({ value }) => value);

    const addop = Parsimmon.alt(
      Parsimmon.string('+').map(_ => (x: number, y: number) => x + y),
      Parsimmon.string('-').map(_ => (x: number, y: number) => x - y)
    );

    const mulop = Parsimmon.alt(
      Parsimmon.string('*').map(_ => (x: number, y: number) => x * y),
      Parsimmon.string('\\').map(_ => (x: number, y: number) => x / y)
    );

    const term: Parser<number> = Parsimmon.lazy(() => chainl(mulop, factor));

    const expr = Parsimmon.lazy(() => chainl(addop, term));

    const factor = parens(expr)
      .or(int)
      .trim(whitespace);

    const calc = expr.skip(Parsimmon.eof);

    it('should parse math operations', () => {
      expect(calc.tryParse('1')).toBe(1);
      expect(calc.tryParse('1 + 1')).toBe(2);
      expect(calc.tryParse('1 + 1 + 1')).toBe(3);
      expect(calc.tryParse('2 * 2')).toBe(4);
    });
  });

  describe('exactIndentation', () => {
    it('will not fail if not expected any indentation', () => {
      expect(() => exactIndentation(0).tryParse('')).not.toThrow();
    });

    it('will fail if there is not enough indentation', () => {
      expect(() => exactIndentation(1).tryParse('')).toThrow();
    });

    it('will not fail if there is enough indentation', () => {
      expect(() => exactIndentation(2).tryParse('  ')).not.toThrow();
    });

    it('will not if there is not enough indentation surrounded by newlines', () => {
      expect(() => exactIndentation(2).tryParse('\n  \n')).not.toThrow();
    });
  });
});
