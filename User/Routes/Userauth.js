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


// http://localhost:5000/api/user/userLogin No login required
router.post('/userlogin', [
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { Mobile_no, Password } = req.body;
    try {
        const user = await User.findOne({ Mobile_no });
        if (!user) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentialsssss" });
        }

        const Pass = await User.findOne({ Password });
        if (!Pass) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        console.log(user, Pass)

        success = true;
        const data = {
            id: user.id,
            success: success
        }
        res.status(200).json({ message: 'User Login successfully', data })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


//update user  http://localhost:5000/api/user/UserUpdate/{id}
router.patch('/UserUpdate/:id', [
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
    // body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    try {
        const { Full_name, Email, Mobile_no, Gender, Location, Birth_date, Profession, Bio, Country, Interst, Star_sign } = req.body;
        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const existingUser = await User.findOne({ Mobile_no: req.body.Mobile_no });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            success = false;
            return res.status(400).json({ success, message: 'Mobile number already exists' });
        }

        const existingUser2 = await User.findOne({ Email: req.body.Email });
        if (existingUser2 && existingUser2._id.toString() !== user._id.toString()) {
            success = false;
            return res.status(400).json({ success, message: 'Email already exists' });
        }

        const newUser = {};
        if (Full_name) { newUser.Full_name = Full_name };
        if (Email) { newUser.Email = Email };
        if (Mobile_no) { newUser.Mobile_no = Mobile_no };
        if (Gender) { newUser.Gender = Gender };
        if (Location) { newUser.Location = Location };
        if (Birth_date) { newUser.Birth_date = Birth_date };
        if (Profession) { newUser.Profession = Profession };
        if (Bio) { newUser.Bio = Bio };
        if (Country) { newUser.Country = Country };
        if (Interst) { newUser.Interst = Interst };
        if (Star_sign) { newUser.Star_sign = Star_sign };

        user = await User.findByIdAndUpdate(req.params.id, { $set: newUser })

        success = true;
        const data = {
            id: user.id,
            success: success
        }

        res.status(200).json({ message: 'User Update successfully', data })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// fatch all users of dating app http://localhost:5000/api/user/fatchAllUsers
router.get('/fatchAllUsers/:id', async (req, res) => {
    const loggedInUserId = req.params.id;
    try {
        const users = await User.find({ _id: { $ne: loggedInUserId } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// fatch login users of dating app http://localhost:5000/api/user/getuser
router.get('/getuser/:id', async (req, res) => {
    try {
        // const userId = req.params.id;
        // const user = await User.findById(userId);
        console.log(req.params.id);
        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        } else {
            res.send(user)
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router