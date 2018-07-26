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
