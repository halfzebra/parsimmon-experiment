import { variable } from './variable';

describe('variable', () => {
  it('should parse a lower-case variable', () => {
    expect(variable.parse('main').status).toBe(true);
  });

  it('should parse a camel-case variable', () => {
    expect(variable.parse('toString').status).toBe(true);
  });

  it('should parse namespaced variable', () => {
    expect(variable.parse('Html.Cmd').status).toBe(true);
  });

  it('should parse an operator in parenthesis', () => {
    expect(variable.parse('(=>)').status).toBe(true);
  });

  it('should parse tuple constructor', () => {
    expect(variable.parse('(,,,)').status).toBe(true);
  });

  it('should parse an empty tuple', () => {
    expect(variable.parse('()').status).toBe(true);
  });
});
