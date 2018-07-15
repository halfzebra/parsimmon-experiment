import { unindent } from './util';

describe('unindent', () => {
  it('should remove leading line-break', () => {
    expect(unindent`
      1
      2
      3`).toBe('1\n2\n3');
  });

  it('should remove trailing line-break and spaces', () => {
    expect(unindent`
      1
      2
      3
            `).toBe('1\n2\n3');
  });
});
