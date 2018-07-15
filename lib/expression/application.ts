import * as Parsimmon from 'parsimmon';
import { OpTable } from '../binOp';
import { term } from '../expression';
import { chainl, countIndent, spaces1, whitespace } from '../helpers';

export const spacesOrIndentedNewline = (indentation: number) =>
  Parsimmon.alt(
    spaces1,
    countIndent
      .chain(column => {
        // console.log(`column < indentation ${column} < ${indentation}`);
        if (column < indentation) {
          return Parsimmon.fail(
            'Arguments have to be at least the same indentation as the function'
          );
        }
        return whitespace;
      })
      .desc(`${indentation} spaces`)
  );

const withColumn = (fn: (value: any) => Parsimmon.Parser<any>) =>
  Parsimmon.index.map(({ column }) => column).chain(fn);

const applicationNode = (a: any, b: any) => ({
  name: 'application',
  value: [a, b]
});

export const application = (ops: OpTable) =>
  Parsimmon.lazy(() =>
    withColumn((column: number) =>
      chainl(
        spacesOrIndentedNewline(column - 1).map(() => applicationNode),
        term(ops)
      )
    )
  ).node('application');
