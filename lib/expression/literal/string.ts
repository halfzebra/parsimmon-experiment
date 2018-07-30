import Parsimmon from 'parsimmon';

const doubleQuote = Parsimmon.string(`"`).desc('"');

const threeDoubleQuotes = Parsimmon.string('"""');

const singleString = doubleQuote
  .then(Parsimmon.regex(/(\\\\|\\"|[^"\n])*/))
  .skip(doubleQuote);

const multiString = threeDoubleQuotes
  .then(Parsimmon.regex(/[^"]*/))
  .skip(threeDoubleQuotes);

// The order is important, because `singleString` will match the opening """ of a multi-line.
export const string = multiString.or(singleString).node('String');
