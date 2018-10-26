import { breakArray } from './breakArray';

describe('break', () => {
  it('should return an array with two empty arrays if empty array was passed', () => {
    expect(breakArray(x => false, [])).toEqual([[], []]);
  });
  it('breaks in the middle of the list', () => {
    expect(breakArray(x => 3 < x, [1, 2, 3, 4, 1, 2, 3, 4])).toEqual([
      [1, 2, 3],
      [4, 1, 2, 3, 4]
    ]);
  });
  it('breaks on the first item', () => {
    expect(breakArray(x => x < 5, [1, 2, 3])).toEqual([[], [1, 2, 3]]);
  });
  it("doesn't break for any element", () => {
    expect(breakArray(x => 5 < x, [1, 2, 3])).toEqual([[1, 2, 3], []]);
  });
  // it('should throw if `predicate` is not a function', () => {
  //   expect(() => breakArray(1, [])).toThrow(
  //     `breakArray: got 'number' instead of a function as 'predicate'`
  //   );
  // });
  // it('should throw if `list` is not an Array', () => {
  //   expect(() => breakArray(() => false, 'a')).toThrow(
  //     `breakArray: got 'string' instead of an 'Array'`
  //   );
  // });
});
