var moment = require('moment');
var generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf()
    }
};
var generateLocationMessage = (from, latitude, longitude) => {
    return {
        from,
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: moment().valueOf()
    };
};
class Messages {
    constructor() {
        this.messages = [];
    }
    addMessage(from, text, createdAt) {
        var message = { from, text, createdAt };
        this.messages.push(message);
        return message;
    }
    getMessageList() {
        return this.messages;
    }
}
module.exports = { generateMessage, generateLocationMessage, Messages };