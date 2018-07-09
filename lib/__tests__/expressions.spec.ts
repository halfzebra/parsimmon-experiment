import { isExpression, unindent } from './util';

describe('expressions', () => {
  describe('letExpression', () => {
    it('should parse a single binding', () => {
      expect(isExpression('let a = 42 in a')).toBe(true);
      expect(isExpression('let _ = 42 in 24')).toBe(true);
      expect(isExpression('let letter = 1 \n in letter')).toBe(true);
    });

    it('should bind to _', () => {
      expect(isExpression('let _ = 42 in 24')).toBe(true);
    });

    it('can start with a tag name', () => {
      expect(isExpression('let letter = 1 \n in letter')).toBe(true);
    });
  });

  describe.skip('case', () => {
    it('simple statement', () => {
      expect(
        isExpression(unindent`
          case x of
            Nothing ->
              0
            Just y ->
              y`)
      ).toBe(true);
    });
  });

  describe('case', () => {
    it('simple statement', () => {
      expect(isExpression(`"Module.a"`)).toBe(true);
    });
  });
});
