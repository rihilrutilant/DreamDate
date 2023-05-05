const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    UserID: {
        type: String,
        required: true
    },
    imgpath: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: Date.now
    }
});

const users = new mongoose.model("usersImage", userSchema);

module.exports = users;