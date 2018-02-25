const P = require('parsimmon');

const upper = P.regex(/[A-Z]/);

module.exports = {

    name: name = parser => P.seqMap(
        parser,
        P.regex(/[a-zA-Z0-9-_]*/),
        (parserValue, nameRest) => parserValue + nameRest
    ),
    upName: name(upper)
}