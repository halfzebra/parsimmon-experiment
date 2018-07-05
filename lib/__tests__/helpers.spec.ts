import {
  loName,
  moduleName,
  upName,
  initialSymbol,
  operator,
  symbol,
  symbol_
} from '../helpers';

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
      expect(loName.tryParse('bar')).toBe('bar');
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
});
