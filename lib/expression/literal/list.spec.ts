import { operators } from '../../binOp';
import { parseExpression } from '../../ast';

describe('List', () => {
  it('can parse empty list', () => {
    expect(parseExpression(operators).parse('[]')).toMatchObject({
      status: true
    });
  });

  it.skip('can parse empty list with spaces', () => {
    expect(parseExpression(operators).parse('[  ]')).toMatchObject({
      status: true
    });
  });

  it('can parse simple list', () => {
    expect(parseExpression(operators).parse('[1, 2]')).toMatchObject({
      status: true
    });
  });

  it('can parse Tuple list', () => {
    expect(parseExpression(operators).parse('[(a, b), (a, b)]')).toMatchObject({
      status: true
    });
  });
});
