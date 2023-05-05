const express = require('express');
const User = require('../../User/Models/Userauth');
const router = express.Router();
const Connection_history = require('../../Connection_history/Models/Connection_history')
const { body, validationResult } = require('express-validator');

// Router:1 fetch all liked profile of logged in user http://localhost:5000/api/Connections/connected_list/ {id}
router.post('/connected_list/:id', async (req, res) => {

    let user = await User.findById(req.params.id);
    if (user) {

        let allLikedProfile = await Connection_history.find({ User_id: req.params.id });
        if (allLikedProfile) {

            const all_ids = allLikedProfile.map((items) => {
                return items.Selected_profile_id;
            })

            const all_profiles = []

            for (let index = 0; index < all_ids.length; index++) {
                const element = all_ids[index];
                const profile = await User.findById(element)
                all_profiles.push(profile)
            }
            res.status(200).send(all_profiles);
        }
        else {
            success = false;
            return res.status(400).json({ success, error: "This profile does not exist" })
        }
    }
    else {
        success = false;
        return res.status(400).json({ success, error: "You should have sign in first" })
    }
})

module.exports = router