const express = require('express');
const User = require('../Models/Userauth');
const router = express.Router();
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
    res.status(200).send("Server has been running on port");
})

// For user sign in http://localhost:5000/api/user/userSignUn

router.post('/userSignUn', [
    body('Full_name', 'Enter a your full name').isLength({ min: 2 }),
    body('Email', 'Enter a valid email').isEmail(),
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Gender', 'Please enter a Gender'),
    body('Location', 'Please enter a Location'),
    body('Birth_date', 'Please enter a Birth_date'),
    body('Profession', 'Please enter a Profession'),
    body('Bio', 'Please enter a Bio'),
    body('Country', 'Please enter a Country'),
    body('Interst', 'Please enter a Interst'),
    body('Star_sign', 'Please enter a Star_sign'),
    body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ Email: req.body.Email });
        if (user) {
            success = false;
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
        }

        user = await User.findOne({ Mobile_no: req.body.Mobile_no });
        if (user) {
            success = false;
            return res.status(400).json({ success, error: "Sorry a user with this mobile number already exists" })
        }

        // Create a new user
        user = await User.create({
            Full_name: req.body.Full_name,
            Email: req.body.Email,
            Mobile_no: req.body.Mobile_no,
            Gender: req.body.Gender,
            Location: req.body.Location,
            Birth_date: req.body.Birth_date,
            Profession: req.body.Profession,
            Bio: req.body.Bio,
            Country: req.body.Country,
            Interst: req.body.Interst,
            Star_sign: req.body.Star_sign,
            Password: req.body.Password,
        });

        success = true;
        const data = {
            id: user.id,
            success: success
        }

        res.status(200).send({
            message: 'User sign in successfully',
            data: data
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router