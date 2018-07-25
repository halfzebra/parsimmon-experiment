import { tuple } from './tuple';
import { operators } from '../../binOp';
import { parseExpression } from '../../ast';

describe('tuples', () => {
  it('can parse empty tuple', () => {
    expect(parseExpression(operators).parse('()').status).toBe(true);
    expect(parseExpression(operators).parse('()').value.value.name).toBe(
      'Tuple'
    );
  });

  it('should parse empty tuple with spaces inside', () => {
    expect(parseExpression(operators).parse('(   )').status).toEqual(true);
  });

  it('can parse simple tuple', () => {
    expect(parseExpression(operators).parse('(a, b)')).toMatchObject({
      status: true
    });
  });

  it('can parse simple tuple with format', () => {
    expect(tuple(operators).parse('( a, b )').status).toBe(true);
  });
});
