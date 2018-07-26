import * as Parsimmon from 'parsimmon';
import { OperatorTable } from '../binOp';
import { term } from '../expression';
import {
  chainl,
  countIndent,
  spaces1,
  whitespace,
  withColumn
} from '../helpers';

export const spacesOrIndentedNewline = (indentation: number) =>
  Parsimmon.alt(
    spaces1,
    countIndent
      .chain(column => {
        if (column < indentation) {
          return Parsimmon.fail(
            'Arguments have to be at least the same indentation as the function'
          );
        }
        return whitespace;
      })
      .desc(`${indentation} spaces`)
  );

const applicationNode = (a: any, b: any) => ({
  name: 'Application',
  value: [a, b]
});

export const application = (ops: OperatorTable) =>
  Parsimmon.lazy(() =>
    withColumn((column: number) =>
      chainl(
        spacesOrIndentedNewline(column).map(() => applicationNode),
        term(ops)
      )
    )
  );
