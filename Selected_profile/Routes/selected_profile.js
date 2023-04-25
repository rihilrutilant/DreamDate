const express = require('express');
const User = require('../Models/Selected_profile');
const router = express.Router();
const { body, validationResult } = require('express-validator');

router.get('/', (req, res) => {
    res.status(200).send("Server has been running on port");
})

module.exports = router