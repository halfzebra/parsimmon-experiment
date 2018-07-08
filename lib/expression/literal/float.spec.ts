import { float } from './float';

describe('float', () => {
  it('should not fail to parse a valid integer', () => {
    expect(() => float.tryParse('1.4')).not.toThrow();
  });

  it('should  parse the integer correctly', () => {
    expect(float.tryParse('1.1')).toEqual(1.1);
  });

  it('should  parse the negative integer correctly', () => {
    expect(float.tryParse('-1.5')).toEqual(-1.5);
  });

  it('should  parse the integer, preceeded by a plus sign correctly', () => {
    expect(float.tryParse('+1.612')).toEqual(1.612);
  });
});
