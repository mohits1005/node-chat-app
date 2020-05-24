const mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    from: {
        type: String,
        require: true
    },
    text: {
        type: String,
        require: true
    },
    createdAt: {
        type: String,
        require: true
    }
});

MessageSchema.statics.findMessages = function() {
    var Message = this;
    return Message.find({}).then(messages => {
        if (!messages) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            resolve(messages);
        });
    });
};

var Message = mongoose.model('Message', MessageSchema);

module.exports = {
    Message
};