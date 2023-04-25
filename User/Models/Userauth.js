const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema({
    Full_name: {
        type: String,
        require: true,
    },
    Email: {
        type: String,
        require: true,
        unique: true,
    },
    Mobile_no: {
        type: String,
        require: true,
        unique: true,
    },
    Gender: {
        type: String,
        require: true
    },
    Location: {
        type: String,
        require: true
    },
    Birth_date: {
        type: String,
        require: true
    },
    Profession: {
        type: String,
        require: true
    },
    Bio: {
        type: String,
        require: true
    },
    Country: {
        type: String,
        require: true,
    },
    // Images: {
    //     type: Buffer,
    //     require: true
    // },
    Interst: {
        type: String,
        require: true,
    },
    Star_sign: {
        type: String,
        require: true,
    },
    Connects: {
        type: String,
        default: '100'
    },
    Password: {
        type: String,
        require: true,
    },
    Date: {
        type: Date,
        default: Date.now
    }
});

const User_db = mongoose.model('User', User);
module.exports = User_db;