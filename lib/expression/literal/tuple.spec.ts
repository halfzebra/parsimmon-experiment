import { tuple } from './tuple';
import { operators } from '../../binOp';
import { parseExpression } from '../../ast';

describe('tuples', () => {
  it('can parse empty tuple', () => {
    expect(parseExpression(operators).parse('()').status).toBe(true);
  });

  it('can parse empty tuple with spaces inside', () => {
    expect(parseExpression(operators).tryParse('(   )')).toEqual([]);
  });

  it.skip('can parse simple tuple', () => {
    expect(parseExpression(operators).parse('(a, b)').status).toBe(true);
  });

  it.skip('can parse simple tuple with format', () => {
    expect(tuple(operators).parse('( a, b )').status).toBe(true);
  });
});
