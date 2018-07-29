import * as Parsimmon from 'parsimmon';
import { lookahead } from './lookahead';

describe('lookahead', () => {
  it('should yield the expected result from the parser', () => {
    expect(
      lookahead(Parsimmon.string('hello'))
        .skip(Parsimmon.any.many())
        .tryParse('hello')
    ).toBe('hello');
  });

  it('should not consume the input', () => {
    expect(
      Parsimmon.seq(
        lookahead(Parsimmon.string('hello')),
        Parsimmon.string('hello')
      ).tryParse('hello')
    ).toEqual(['hello', 'hello']);
  });
});
