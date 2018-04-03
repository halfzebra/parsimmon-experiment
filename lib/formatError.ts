import chalk from 'chalk';
import { Failure } from 'parsimmon';

const NEWLINE_REGEX = /\r\n|[\n\r\u2028\u2029]/;
const NEWLINE = '\n';

const arrowUp = chalk.red.bold('^');
const arrowRight = chalk.red.bold('>');

export function formatError(result: Failure, input: string) {
  const lines = input.split(NEWLINE_REGEX).map((lineSource, lineNumber) => ({
    lineNumber: lineNumber + 1,
    lineSource
  }));
  const lineNumberLabelLength = lines.length.toString().length;

  const { line, column } = (result as Failure).index;

  const errorHighlight = {
    lineNumber: ' '.repeat(lineNumberLabelLength),
    lineSource: ' '.repeat(column - 1) + arrowUp
  };

  const linesWithErrorHighLight = [
    ...lines.slice(0, line),
    errorHighlight,
    ...lines.slice(line)
  ];

  const linesWithError = linesWithErrorHighLight.slice(line - 2, line + 3);

  const codeSnippet = linesWithError
    .map(({ lineNumber, lineSource }) => {
      const prefix = lineNumber === line ? `${arrowRight} ` : '  ';
      return prefix + chalk.gray(lineNumber + ' |') + ` ${lineSource}`;
    })
    .join(NEWLINE);

  return [
    NEWLINE,
    chalk.red.bold('-- PARSING FAILED ' + '-'.repeat(50)),
    NEWLINE,
    NEWLINE,
    codeSnippet,
    NEWLINE,
    NEWLINE,
    'Expected one of the following: ',
    NEWLINE,
    ' '.repeat(2),
    NEWLINE,
    result.expected.map(x => JSON.stringify(x)).join(', ')
  ].join('');
}
