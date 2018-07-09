import {comment} from "./comment";

describe('comment', () => {
  it('should parse single-line comment', () => {
    expect(() => comment.tryParse(`-- hello`)).not.toThrow();
  });

  it('shoudl parse multi-line comment with one line', () => {
    expect(() => comment.tryParse(`{- hello -}`)).not.toThrow();
  });

  it('shoudl parse  multi-line comment with multiple lines', () => {
    expect(() =>
      comment.tryParse(`{- hello
       -}`)
    ).not.toThrow();
  });

  it('shoudl parse  multi-line comment with multiple lines', () => {
    expect(() => comment.tryParse(`{- hello {- world -} -}`)).not.toThrow();
  });
});
