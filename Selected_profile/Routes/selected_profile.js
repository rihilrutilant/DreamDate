const express = require('express');
const Selected_profile = require('../Models/Selected_profile');
const Accepted_profile = require('../Models/Accepted_profiles')
const User = require("../../User/Models/Userauth")
const router = express.Router();
const Connection_history = require('../../Connection_history/Models/Connection_history')



// Router:1 For storeing liked profiles  http://localhost:5000/api/like_profile/likedProfiles
router.post('/likedProfiles', async (req, res) => {

    const { User_id, Selected_profile_id } = req.body

    let success = false;
    try {
        // Check whether the user exeist or not
        let user = await User.findById(User_id);

        let user_connects = parseInt(user.Connects)
        if (user_connects > 6) {

            if (user !== null) {
                // Check whether the user exeist or not
                let s_user = await User.findById(Selected_profile_id);


                if (s_user !== null) {
                    // Check whether the user exeist in sected profile page or not
                    let s_profile = await Selected_profile.find({ User_id: User_id });


                    const all_ids = s_profile.map((items) => {
                        return items.Selected_profile_id;
                    })

                    for (let index = 0; index < all_ids.length; index++) {
                        const element = all_ids[index];
                        if (element == Selected_profile_id) {
                            success = false;
                            return res.status(400).json({ success, error: "You have aleready liked this profile" })
                        }
                    }
                    user = await Selected_profile.create({
                        User_id: User_id,
                        Selected_profile_id: Selected_profile_id,
                    });

                    await Connection_history.create({
                        User_id: User_id,
                        Selected_profile_id: Selected_profile_id,
                    });

                    const total_connections = user_connects - 6

                    const new_user = {}
                    new_user.Connects = total_connections;

                    await User.findByIdAndUpdate(User_id, { $set: new_user })


                    success = true
                    const data = {
                        id: user.id,
                        success: success
                    }
                    res.status(200).json({
                        message: 'selected profile added successfully',
                        data: data
                    })
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
        }
        else {
            success = false;
            return res.status(400).json({ success, error: "You don't have enough connection for sending request" })
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// Router:2 fetch all liked profile of logged in user http://localhost:5000/api/like_profile/allLikedProfile/{id}  user id
router.post('/allLikedProfile/:id', async (req, res) => {

    let user = await User.findById(req.params.id);
    if (user) {

        let allLikedProfile = await Selected_profile.find({ User_id: req.params.id });
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


// Router:3 fetch all request for connection of logged in user http://localhost:5000/api/like_profile/allrequestsProfile/{id} user id
router.post('/allrequestsProfile/:id', async (req, res) => {

    let user = await User.findById(req.params.id);
    if (user) {

        let allLikedProfile = await Selected_profile.find({ Selected_profile_id: req.params.id });
        if (allLikedProfile) {

            const all_ids = allLikedProfile.map((items) => {
                return items.User_id;
            })

            const ids = allLikedProfile.map((items) => {
                return items.id;
            })

            const all_profiles = []

            for (let index = 0; index < all_ids.length; index++) {
                const element = all_ids[index];
                const profile = await User.findById(element)
                all_profiles.push({ profile: profile, ids: ids[index] })
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


// Router:4 accept user request logged in user http://localhost:5000/api/like_profile/acceptrequest/{id} user id
router.post('/acceptrequest/:id', async (req, res) => {
    let id = req.params.id;

    const { Accepted_profile_id, selected_profile_db_id } = req.body

    let success = false;
    try {
        // Check whether the user exeist or not
        let user = await User.findById(id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let userac = await Selected_profile.findById(selected_profile_db_id);
        if (userac) {

            if (userac.Selected_profile_id == id) {

                const uid = userac.id
                const useraccepted = await Accepted_profile.create({
                    User_id: id,
                    Accepted_profile_id: Accepted_profile_id,
                });
                await Selected_profile.findByIdAndDelete({ _id: uid });
                success = true
                const data = {
                    id: useraccepted.id,
                    success: success
                }
                res.status(200).json({
                    message: 'profile accepted successfully',
                    data: data
                })
            }
            else {
                success = false
                res.status(404).json({ success, error: "You can not add this account" })
            }
        }
        else {
            success = false
            res.status(404).json({ success, error: "this account is already added May be" })
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// Router:5 ignore user request logged in user http://localhost:5000/api/like_profile/ignorRequest/{id}  selected_profile_db_id
router.delete('/ignorRequest/:id', async (req, res) => {
    let id = req.params.id;
    const { selected_profile_db_id } = req.body

    let success = false;
    try {
        // Check whether the user exeist or not
        let user = await User.findById(id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let userac = await Selected_profile.findById(selected_profile_db_id);
        if (userac) {
            const uid = userac.id
            const useraccepted = await Selected_profile.findByIdAndDelete({ _id: uid });
            success = true
            const data = {
                id: useraccepted.id,
                success: success
            }
            res.status(200).json({
                message: 'profile ingnored successfully',
                data: data
            })
        }
        else {
            success = false
            res.status(404).json({ success, error: "account can't delete" })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// Router:6 unfoellw the accepted profile user request logged in user http://localhost:5000/api/like_profile/unfollowTheAcceptedProfile/ {id}
router.delete('/unfollowTheAcceptedProfile/:id', async (req, res) => {
    let id = req.params.id;
    const { Accepted_profile_id } = req.body

    let success = false;
    try {
        // Check whether the user exeist or not
        let user = await User.findById(id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let allprofiles = await Accepted_profile.find({ User_id: id })

        if (allprofiles) {
            const all_ids = allprofiles.map((items) => {
                return items.Accepted_profile_id;
            })

            for (let index = 0; index < all_ids.length; index++) {
                const element = all_ids[index];
                if (element == Accepted_profile_id) {
                    const userdeleted = await Accepted_profile.findOneAndDelete({ Accepted_profile_id: element });
                    success = true
                    const data = {
                        id: userdeleted.id,
                        success: success
                    }
                    res.status(200).json({
                        message: 'profile deleted successfully',
                        data: data
                    })
                    break
                }
            }
        }
        else {
            success = false
            res.status(404).json({ success, error: "You can't remove this profile" })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// Router:7 fetch all accepted profile http://localhost:5000/api/like_profile/allacceptedProfile/{id} user id
router.post('/allacceptedProfile/:id', async (req, res) => {

    let user = await User.findById(req.params.id);
    if (user) {

        let allLikedProfile = await Accepted_profile.find({ User_id: req.params.id });
        if (allLikedProfile) {

            const all_ids = allLikedProfile.map((items) => {
                return items.Accepted_profile_id;
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


// Router:8 fetch all accepted profile http://localhost:5000/api/like_profile/allfollowersProfile/{id} user id
router.post('/allfollowersProfile/:id', async (req, res) => {

    let user = await User.findById(req.params.id);
    if (user) {

        let allLikedProfile = await Accepted_profile.find({ Accepted_profile_id: req.params.id });
        if (allLikedProfile) {

            const all_ids = allLikedProfile.map((items) => {
                return items.User_id;
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