const express = require('express');
const User = require('../Models/Userauth');
const users = require('../Models/UserImage')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const twilio = require('twilio'); // We'll use Twilio to send OTP via SMS
const randomstring = require('randomstring'); // We'll use the `randomstring` package to generate random OTP
const dotenv = require('dotenv')
const fs = require('fs');
const multer = require("multer");

dotenv.config()



// image upload into upload folder

const imgconfig = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./uploads")
    },
    filename: (req, file, callback) => {
        callback(null, `imgae-${Date.now()}. ${file.originalname}`)
    }
})

// img filter
const isImage = (req, file, callback) => {
    if (file.mimetype.startsWith("image")) {
        callback(null, true)
    } else {
        callback(new Error("only images is allowd"))
    }
}

const upload = multer({
    storage: imgconfig,
    fileFilter: isImage
});


// --------------------  ALL USER API  --------------------------------


//ROUTE 1: For user sign in http://localhost:5000/api/user/userSignUn 
router.post('/userSignUn', upload.single("photo"), [
    body('Full_name', 'Enter a your full name').isLength({ min: 2 }),
    body('Email', 'Enter a valid email').isEmail(),
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 5 }),
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

        const { filename } = req.file;

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
            Imgpath: filename,
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
});


//ROUTE 2: http://localhost:5000/api/user/userLogin No login required
router.post('/userlogin', [
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 5 }),
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


//ROUTE 3:update user  http://localhost:5000/api/user/UserUpdate/{id}
router.patch('/UserUpdate/:id', upload.single("photo"), [
    body('Full_name', 'Enter a your full name').isLength({ min: 2 }),
    body('Gender', 'Please enter a Gender'),
    body('Location', 'Please enter a Location'),
    body('Birth_date', 'Please enter a Birth_date'),
    body('Profession', 'Please enter a Profession'),
    body('Bio', 'Please enter a Bio'),
    body('Country', 'Please enter a Country'),
    body('Interst', 'Please enter a Interst'),
    body('Star_sign', 'Please enter a Star_sign')
], async (req, res) => {
    try {
        const { Full_name, Gender, Location, Birth_date, Profession, Bio, Country, Interst, Star_sign } = req.body;
        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const nameOfFile = user.Imgpath;
        const { filename } = req.file;

        const newUser = {};
        if (Full_name) { newUser.Full_name = Full_name };
        if (Gender) { newUser.Gender = Gender };
        if (Location) { newUser.Location = Location };
        if (Birth_date) { newUser.Birth_date = Birth_date };
        if (Profession) { newUser.Profession = Profession };
        if (Bio) { newUser.Bio = Bio };
        if (Country) { newUser.Country = Country };
        if (filename) { newUser.Imgpath = filename }
        if (Interst) { newUser.Interst = Interst };
        if (Star_sign) { newUser.Star_sign = Star_sign };


        const dirPath = __dirname;   //C:\Users\admin\Desktop\Dating_app_Backend\User\Routes
        const dirname = dirPath.slice(0, -12);
        const filePath = dirname + '/uploads/' + nameOfFile;    //C:\Users\admin\Desktop\Dating_app_Backend

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
                success = false;
                res.status(404).json({ success, error: 'Error deleting file' });
                return;
            }
        });

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


//ROUTE 4: fatch all users of dating app http://localhost:5000/api/user/fatchAllUsers
router.post('/fatchAllUsers/:id', async (req, res) => {
    const loggedInUserId = req.params.id;
    try {
        // chechk string contain "," or not return true of false
        const containsSpecialChars = (str) => {
            const specialChars = /,/;
            return specialChars.test(str);
        }

        const userIdSet = []
        const cridencials = []
        const allusers = []
        const user = await User.findById(loggedInUserId)
        const users = await User.find({ _id: { $ne: loggedInUserId } });

        const alluser = users.map((items) => {
            return items
        })

        for (let ind = 0; ind < alluser.length; ind++) {
            const ele = alluser[ind];
            allusers.push(ele)
        }

        const arr = user.Interst
        let myArray = []
        if (containsSpecialChars(arr)) {
            myArray = arr.split(',');
        }
        else {
            myArray = [arr];
        }

        for (let index = 0; index < myArray.length; index++) {
            const element = myArray[index];

            for (let index2 = 0; index2 < allusers.length; index2++) {
                const element2 = allusers[index2].Interst;

                let userArr = []
                if (containsSpecialChars(element2)) {
                    userArr = element2.split(',');
                }
                else {
                    userArr = [element2];
                }

                for (let indx = 0; indx < userArr.length; indx++) {
                    if (element == userArr[indx]) {
                        userIdSet.push(allusers[index2].id)
                    }
                }
            }
        }

        let uniqueChars = [...new Set(userIdSet)];

        for (let j = 0; j < uniqueChars.length; j++) {
            const element = await User.findById(uniqueChars[j]);
            cridencials.push(element)
        }

        res.json(cridencials);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//ROUTE 5: fatch login users of dating app http://localhost:5000/api/user/getuser
router.post('/getuser/:id', async (req, res) => {
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


//ROUTE 6: Send otp http://localhost:5000/api/user/verifyMobileNo
const otpMap = new Map();


router.post('/verifyMobileNo',
    [
        body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 5 }),
    ],
    async (req, res) => {
        try {
            const { Mobile_no } = req.body;
            const mob = Mobile_no
            let success = false;

            let user = await User.findOne({ Mobile_no: Mobile_no });
            if (!user) {
                success = false;
                return res.status(404).json({ success, error: "Mobile Does not exsit" })
            }

            if (user.Mobile_no == Mobile_no) {
                const otp = randomstring.generate({ length: 4, charset: 'numeric' });

                const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `Verify Your Mobile Number With This One Time Password ${otp}`,
                    from: process.env.TWILIO_FROM_PHONE_NUMBER,
                    to: mob
                });

                otpMap.set(mob, otp);
                success = true;
                res.status(200).json({ success, message: 'OTP sent successfully' });
            }
            else {
                success = false;
                return res.status(404).json({ success, error: "Enter Valide Mobile number" })
            }

        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occured");
        }
    }
)


//ROUTE 7: verify otp http://localhost:5000/api/user/verifyOtp
router.post('/verifyOtp',
    [
        body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 5 }),
        body('otp', 'Enter a valid otp number').isLength({ min: 4, max: 4 }),
    ],
    async (req, res) => {
        const { Mobile_no, otp } = req.body;

        const mob = Mobile_no

        let success = false;

        let user = await User.findOne({ Mobile_no: Mobile_no });
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        if (user.Mobile_no == Mobile_no) {
            // Check if the OTP exists for the given mobile number
            if (otpMap.has(mob)) {
                // Get the stored OTP
                const storedOtp = otpMap.get(mob);

                // Check if the entered OTP matches the stored OTP
                if (otp === storedOtp) {
                    // OTP authentication successful
                    success = true;
                    const data = {
                        id: user.id,
                        success: success
                    }
                    res.status(200).json({ message: 'OTP authentication successful', data })
                } else {
                    // Invalid OTP
                    success = false;
                    return res.status(404).json({ success, error: 'Invalid OTP' });
                }
            } else {
                // OTP not found for the given mobile number
                success = false;
                return res.status(404).json({ success, error: 'OTP not found for the given mobile number' });
            }
        }
        else {
            success = false;
            return res.status(404).json({ success, error: "Enter Valide Mobile number" })
        }
    }
)


//ROUTE 8: forget password http://localhost:5000/api/user/forgetPassword/64426506a64f5121f673ea55
router.patch('/forgetPassword/:id', [
    body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    try {
        const { Password } = req.body;
        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const newUser = {};
        if (Password) { newUser.Password = Password };

        user = await User.findByIdAndUpdate(req.params.id, { $set: newUser })

        success = true;
        const data = {
            id: user.id,
            success: success
        }

        res.status(200).json({ message: 'Password Update successfully', data })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


const otpMap2 = new Map();
//ROUTE 9: forget password http://localhost:5000/api/user/verifyMobileNoSignUp
router.post('/verifyMobileNoSignUp',
    [
        body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 5 }),
    ],
    async (req, res) => {
        try {
            const { Mobile_no } = req.body;
            const mob = Mobile_no
            let success = false;
            const otp = randomstring.generate({ length: 4, charset: 'numeric' });

            const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            await client.messages.create({
                body: `Verify Your Mobile Number With This One Time Password ${otp}`,
                from: process.env.TWILIO_FROM_PHONE_NUMBER,
                to: mob
            });

            otpMap2.set(mob, otp);
            success = true;
            res.status(200).json({ success, message: 'OTP sent successfully' });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occured");
        }
    }
)


//ROUTE 10: verify otp http://localhost:5000/api/user/verifyOtpSignUp
router.post('/verifyOtpSignUp',
    [
        body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 5 }),
        body('otp', 'Enter a valid otp number').isLength({ min: 4, max: 4 }),
    ],
    async (req, res) => {
        const { Mobile_no, otp } = req.body;

        const mob = Mobile_no

        let success = false;
        if (otpMap2.has(mob)) {
            // Get the stored OTP
            const storedOtp = otpMap2.get(mob);

            // Check if the entered OTP matches the stored OTP
            if (otp === storedOtp) {
                // OTP authentication successful
                success = true;
                res.status(200).json({ success, message: 'OTP authentication successful' });
            } else {
                // Invalid OTP
                success = false;
                return res.status(404).json({ success, error: 'Invalid OTP' });
            }
        } else {
            // OTP not found for the given mobile number
            success = false;
            return res.status(404).json({ success, error: 'OTP not found for the given mobile number' });
        }
    }
)


//ROUTE 11: get images from user and store in database http://localhost:5000/api/user/UploadUserImages/{id}
router.post('/UploadUserImages/:id', upload.single("photo"), async (req, res) => {
    try {
        const { filename } = req.file;
        const { id } = req.params;

        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const userdata = new users({
            UserID: id,
            imgpath: filename,
        });

        const finaldata = await userdata.save();

        success = true;
        const data = {
            id: finaldata.id,
            success: success
        }

        res.status(200).json({ message: 'Password Update successfully', data })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// ROUTE 12: get all images of user http://localhost:5000/api/user/fetchUserImages/{id}
router.post("/fetchUserImages/:id", async (req, res) => {
    try {
        let success = false;
        const { id } = req.params;
        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }
        const getUser = await users.find({ UserID: id });
        res.status(201).json(getUser)
    } catch (error) {
        res.status(401).json({ status: 401, error })
    }
});


// ROUTE 13:delete images of user http://localhost:5000/api/user/deleteuserimage/{Imageid}  :- id of image
router.delete("/deleteuserimage/:Imageid", async (req, res) => {

    try {
        const { Imageid } = req.params;
        let user = await users.findById(Imageid);

        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const fileName = user.imgpath;
        const dirPath = __dirname;   //C:\Users\admin\Desktop\Dating_app_Backend\User\Routes
        const dirname = dirPath.slice(0, -12);
        const filePath = dirname + '/uploads/' + fileName;    //C:\Users\admin\Desktop\Dating_app_Backend

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
                success = false;
                res.status(404).json({ success, error: 'Error deleting file' });
                return;
            }
        });

        const dltUser = await users.findByIdAndDelete({ _id: Imageid });

        success = true;
        const data = {
            id: dltUser.id,
            success: success
        }

        res.status(200).json({ message: "File deleted successfully", data });

    } catch (error) {
        res.status(401).json({ status: 401, error })
    }

})


module.exports = router