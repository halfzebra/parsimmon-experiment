import { moduleDeclaration } from './statement';

describe('statement', () => {
  describe('moduleDeclaration', () => {
    it('should parse a module declaration', () => {
      expect(moduleDeclaration.tryParse('module Main')).toBe('');
    });
  });
});
