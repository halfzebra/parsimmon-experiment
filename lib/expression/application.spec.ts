import { application, spacesOrIndentedNewline } from './application';
import { operators } from '../binOp';

describe('function application', () => {
  it('should parse simple application', () => {
    expect(application(operators).parse('f a')).toMatchObject({
      status: true,
      value: { name: 'Application' }
    });
  });

  it('should parse curried application', () => {
    expect(application(operators).parse('f a b').status).toEqual(true);
  });

  it('should parse curried application with parens', () => {
    expect(application(operators).parse('(f a) b').status).toEqual(true);
  });

  it('should parse infix operator partial application in prefix notation', () => {
    expect(application(operators).parse('(+) 1')).toMatchObject({
      value: { name: 'Application' }
    });
  });

  it('should parse infix operator application in prefix notation', () => {
    expect(application(operators).parse('(+) a b')).toMatchObject({
      value: { name: 'Application' }
    });
  });

  it.skip('should parse multiline application', () => {
    expect(application(operators).parse(' f\n   a\n b')).toEqual({
      status: true,
      value: { name: 'Application' }
    });
  });

  it('should parse an operator passed to map', () => {
    expect(application(operators).tryParse('reduce (+) list')).toMatchObject({
      name: 'Application'
    });
  });
});

describe('spacesOrIndentedNewline', () => {
  it('should not fail if the column is at the start', () => {
    expect(spacesOrIndentedNewline(0).tryParse('\n\n\n\n\n ')).toBe('');
  });

  it('should fail if there is no indentation', () => {
    expect(() => spacesOrIndentedNewline(1).tryParse('')).toThrow('');
  });

  it('should count only spaces', () => {
    expect(spacesOrIndentedNewline(3).tryParse('\n    ')).toBe('');
  });
});
