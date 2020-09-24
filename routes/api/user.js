const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');



// @route POST api/users
// @desc  Register user
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'please enter a password with 6 or more character').isLength({
        min: 6
    })

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // check if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ error: [{ msg: 'user already exists' }] })
            }
            // attach user gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({ name, email, avatar, password });

            // encrypt the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, 10);

            // saving to database
            await user.save();

            // send jwt 
            let token = user.getAuthToken();
            console.log("tokenfff",token);
            res.send({ token: token })
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Sever error!')
        }

        
    })

module.exports = router;