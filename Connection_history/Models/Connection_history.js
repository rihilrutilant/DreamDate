const mongoose = require('mongoose');
const { Schema } = mongoose;

const Connection_history_Schema = new Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Selected_profile: {
        type: String,
        require: true
    },
    loosed_connections: {
        type: Number,
        default: 0
    },
    Date: {
        type: Date,
        default: Date.now
    }
});

const Connection_history = mongoose.model('Connection_history', Connection_history_Schema);
module.exports = Connection_history;