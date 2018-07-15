import Parsimmon from 'parsimmon';
import { whitespace } from '../helpers';

const singleLineComment = Parsimmon.string('--').then(
  Parsimmon.regex(/.*/)
    .skip(whitespace)
    .node('singleLineComment')
);

const multiLineCommentBegin = Parsimmon.string('{-');
const multiLineCommentEnd = Parsimmon.string('-}');

// A parser for recursive parsing of multi-line comments.
// See more here:
//    https://github.com/jneen/parsimmon/issues/203
const multiLineComment: Parsimmon.Parser<any> = Parsimmon.lazy(() =>
  multiLineCommentBegin.then(
    Parsimmon.alt(
      Parsimmon.notFollowedBy(multiLineCommentBegin)
        .notFollowedBy(multiLineCommentEnd)
        .then(Parsimmon.any),
      multiLineComment
    )
      .many()
      .skip(multiLineCommentEnd)
  )
).tie();

export const comment = singleLineComment.or(multiLineComment);
