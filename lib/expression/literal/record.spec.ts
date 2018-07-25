import {operators} from "../../binOp";
import {parseExpression} from "../../ast";

describe('Record', () => {
  it('should parse record', () => {
    expect(parseExpression(operators).parse('{ a = b }')).toMatchObject({
      status: true
    });
  });

  it.skip('should parse empty record', () => {
    expect(parseExpression(operators).tryParse('{}')).not.toThrow();
  });

  it('should parse a simple record with many fields', () => {
    expect(() =>
      parseExpression(operators).tryParse('{a = b, b = 2}')
    ).not.toThrow();
    expect(parseExpression(operators).parse('{a = b, b = 2}')).toMatchObject({
      status: true
    });
  });

  it('should parse a simple record with many tuple fields', () => {
    expect(() =>
      parseExpression(operators).tryParse('{a = (a, b), b = (a, b)}')
    ).not.toThrow();
    expect(
      parseExpression(operators).parse('{a = (a, b), b = (a, b)}')
    ).toMatchObject({ status: true });
  });

  it('should parse simple record with updated field', () => {
    expect(
      parseExpression(operators).parse('{a | b = 2, c = 3}').value.name
    ).toBe('RecordUpdate');
  });

  it('should parse simple record with advanced field', () => {
    expect(parseExpression(operators).parse('{a = Just 2}').value.name).toBe(
      'Record'
    );
  });

  it('should parse simplified record destructuring pattern', () => {
    expect(parseExpression(operators).parse('{a, b}').status).toBe(true);
  });
});
