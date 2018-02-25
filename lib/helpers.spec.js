const { upName } = require('./helpers');

describe('helpers', () => {
    describe('upName', () => {
        it('should parse a name with first capital letter', () => {
            expect(upName.tryParse('Foo')).toBe('Foo');
        })
        it('should fail to parse a name that starts with a lower-case letter', () => {
            expect(() => upName.tryParse('foo')).toThrow();
        })
        it('should fail to parse a name that starts with a number', () => {
            expect(() => upName.tryParse('1foo')).toThrow();
        })
    });
});