const mongoose = require('mongoose');
const { Schema } = mongoose;

const Selected_profileSchema = new Schema({
    User_id: {
        type: String,
        require: true
    },
    Selected_profile_id: {
        type: String,
        require: true
    },
    Date: {
        type: Date,
        default: Date.now
    }
});

const Selected_profile = mongoose.model('Selected_profile', Selected_profileSchema);
module.exports = Selected_profile;