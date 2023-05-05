const mongoose = require('mongoose');
const { Schema } = mongoose;

const Accepted_profileSchema = new Schema({
    User_id: {
        type: String,
        require: true
    },
    Accepted_profile_id: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        default: Date.now
    }
});

const Accepted_profile = mongoose.model('Accepted_profile', Accepted_profileSchema);
module.exports = Accepted_profile;