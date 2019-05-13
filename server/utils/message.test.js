var expect = require('expect');
var { generateMessage, generateLocationMessage } = require('./message');
expect.extend({
    toBeType(received, argument) {
        const initialType = typeof received;
        const type = initialType === "object" ? Array.isArray(received) ? "array" : initialType : initialType;
        return type === argument ? {
            message: () => `expected ${received} to be type ${argument}`,
            pass: true
        } : {
            message: () => `expected ${received} to be type ${argument}`,
            pass: false
        };
    }
});
describe('generateMessage', () => {
    it('should generate correct message  object', () => {
        var from = 'Moh';
        var text = 'Some Message';
        var message = generateMessage(from, text);
        expect(message.createdAt).toBeType('number');
        expect(message).toEqual(expect.objectContaining({ from, text }));
    });
});
describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        var from = 'Moh';
        var latitude = 15;
        var longitude = 19;
        var url = 'https://www.google.com/maps?q=15,19';
        var message = generateLocationMessage(from, latitude, longitude);
        expect(message.createdAt).toBeType('number');
        expect(message).toEqual(expect.objectContaining({ from, url }));
    });
});