import { character } from './character';

describe('Character literals', () => {
  it('should parse character literal', () => {
    expect(character.parse(`'a'`).status).toBe(true);
  });

  it('should parse newline literal', () => {
    expect(character.parse(`'\n'`).status).toBe(true);
  });

  // FIXME: https://github.com/Bogdanp/elm-ast/blob/master/src/Ast/Expression.elm#L68
  it.skip('should parse char code literals', () => {
    expect(character.tryParse(`'\\x23'`)).toBe(true);
  });

  it('should contain one character', () => {
    expect(character.parse(`''`).status).toBe(false);
  });
});
