export type Assoc = 'N' | 'L' | 'R';

export interface OpTable {
  [key: string]: [Assoc, number];
}

// The default operator precedence table.
export const operators: OpTable = {
  '||': ['L', 2],
  '&&': ['L', 3],
  '==': ['L', 4],
  '/=': ['L', 4],
  '<': ['L', 4],
  '>': ['L', 4],
  '>=': ['L', 4],
  '<=': ['L', 4],
  '++': ['R', 5],
  '::': ['R', 5],
  '+': ['L', 6],
  '-': ['L', 6],
  '*': ['L', 7],
  '/': ['L', 7],
  '%': ['L', 7],
  '//': ['L', 7],
  rem: ['L', 7],
  '^': ['L', 8],
  '<<': ['L', 9],
  '>>': ['L', 9],
  '<|': ['R', 1],
  '|>': ['R', 1],
  '=': ['R', 0]
};
