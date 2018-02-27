import { loName, moduleName, upName, initialSymbol } from './helpers';

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
  });

  describe('moduleName', () => {
    it('shoud parse simple module name', () => {
      expect(moduleName.tryParse('Main')).toEqual(['Main']);
    });

    it('shoud parse a namespaced module name', () => {
      expect(moduleName.tryParse('App.View')).toEqual(['App', 'View']);
    });

    it('shoud parse a module name, surrounded by whitespace', () => {
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
});
