import { tuple } from './tuple';
import { operators } from '../../binOp';

describe.skip('tuples', () => {
  it('can parse empty tuple', () => {
    expect(tuple(operators).parse('()').status).toBe(true);
  });

  it('can parse empty tuple with spaces inside', () => {
    expect(tuple(operators).parse('()').status).toBe(true);
  });

  it('can parse simple tuple', () => {
    // console.log(tuple(operators).tryParse('(a, b)'));
    expect(tuple(operators).parse('(a, b)').status).toBe(true);
  });

  it('can parse simple tuple with format', () => {
    expect(tuple(operators).parse('( a, b )').status).toBe(true);
  });
});
