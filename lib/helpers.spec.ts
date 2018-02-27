import { loName, upName } from './helpers';

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
});
