import { tuple } from './tuple';
import { operators } from '../../binOp';
import { parseExpression } from '../../ast';

describe('tuples', () => {
  it('can parse empty tuple', () => {
    expect(parseExpression(operators).parse('()').status).toBe(true);
    expect(parseExpression(operators).parse('()').value.value.value.name).toBe(
      'Tuple'
    );
  });

  it('can parse empty tuple with spaces inside', () => {
    expect(parseExpression(operators).parse('(   )').status).toEqual(true);
  });

  it.skip('can parse simple tuple', () => {
    expect(parseExpression(operators).tryParse('(a, b)')).toBe(true);
  });

  it.skip('can parse simple tuple with format', () => {
    expect(tuple(operators).parse('( a, b )').status).toBe(true);
  });
});
