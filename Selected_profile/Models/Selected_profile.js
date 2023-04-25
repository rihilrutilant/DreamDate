const mongoose = require('mongoose');
const { Schema } = mongoose;

const Selected_profileSchema = new Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    Selected_profile: {
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