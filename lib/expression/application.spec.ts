import { application } from './application';
import { operators } from '../binOp';

describe('function application', () => {
  it.skip('should parse simple application', () => {
    expect(application(operators).tryParse('f a')).toEqual(false);
  });

  it.skip('should parse curried application', () => {
    expect(application(operators).parse('f a b')).toEqual(false);
  });

  it.skip('should parse curried application', () => {
    expect(application(operators).parse('(f a) b')).toEqual(false);
  });
});
