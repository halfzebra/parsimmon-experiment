export type Assoc = 'None' | 'Left' | 'Right';

export interface OpTable {
  [key: string]: [Assoc, number];
}

// The default operator precedence table.
export const operators: OpTable = {
  '||': ['Left', 2],
  '&&': ['Left', 3],
  '==': ['Left', 4],
  '/=': ['Left', 4],
  '<': ['Left', 4],
  '>': ['Left', 4],
  '>=': ['Left', 4],
  '<=': ['Left', 4],
  '++': ['Right', 5],
  '::': ['Right', 5],
  '+': ['Left', 6],
  '-': ['Left', 6],
  '*': ['Left', 7],
  '/': ['Left', 7],
  '%': ['Left', 7],
  '//': ['Left', 7],
  rem: ['Left', 7],
  '^': ['Left', 8],
  '<<': ['Left', 9],
  '>>': ['Left', 9],
  '<|': ['Right', 1],
  '|>': ['Right', 1],
  '=': ['Right', 0]
};
