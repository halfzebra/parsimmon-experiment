import { string } from './string';

describe('String literals', () => {
  it('should parse empty string', () => {
    expect(string.parse('""').status).toBe(true);
  });

  it('should parse simple string', () => {
    expect(string.parse('"hello"').status).toBe(true);
  });

  it('should parse escaped string', () => {
    expect(string.parse('"hello, \\"world\\""').status).toBe(true);
  });

  it('should parse triple-quoted string', () => {
    expect(string.parse('"\\"\\"\\"\\"\\"\\""').status).toBe(true);
  });

  it('should parse multi-line strings', () => {
    expect(string.parse(`"""hello\nworld"""`).status).toBe(true);
  });

  it('should parse double escaped string', () => {
    expect(string.parse('"\\\\"').status).toBe(true);
  });
});
