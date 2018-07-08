import { integer } from './integer';

describe('int', () => {
  it('should not fail to parse a valid integer', () => {
    expect(() => integer.tryParse('1')).not.toThrow();
  });

  it('should  parse the integer correctly', () => {
    expect(integer.tryParse('1')).toEqual(1);
  });

  it('should  parse the negative integer correctly', () => {
    expect(integer.tryParse('-1')).toEqual(-1);
  });

  it('should  parse the integer, preceeded by a plus sign correctly', () => {
    expect(integer.tryParse('+1')).toEqual(1);
  });
});
