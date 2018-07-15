import Parsimmon from 'parsimmon';

const singleQuote = Parsimmon.string(`'`);

export const character = Parsimmon.any
  .or(
    Parsimmon.string('\\')
      .then(Parsimmon.regex(/(n|t|r|\\|x..)/))
      .chain(value => {
        if (value.length === 0) {
          return Parsimmon.fail('No character');
        } else if (value === 'n') {
          return Parsimmon.succeed('\n');
        } else if (value === 't') {
          return Parsimmon.succeed('\t');
        } else if (value === 'r') {
          return Parsimmon.succeed('\x0D');
        } else if (value === '0') {
          return Parsimmon.succeed('\x00');
        } else if (value === '\\') {
          return Parsimmon.succeed('\\');
        } else if (value.indexOf('x') === 0) {
          const int = parseInt(value, 16);
          if (!Number.isNaN(int)) {
            return Parsimmon.succeed(String.fromCharCode(int));
          }
          return Parsimmon.fail('Invalid charcode');
        }
        return Parsimmon.fail('No such character as ' + JSON.stringify(value));
      })
  )
  .trim(singleQuote);
